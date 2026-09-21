"""Windows compatibility shim for genlayer-test 0.29.2 Direct Mode.

The upstream loader unlinks its stdin backing file while Windows still holds
the duplicated descriptor. Linux and CI do not need this workaround.
"""

import os


def _sync_direct_datetime(timestamp):
    try:
        from genlayer import gl
        gl.message_raw["datetime"] = timestamp
    except (ImportError, AttributeError, TypeError):
        pass


def pytest_configure(config):
    original_unlink = os.unlink

    def unlink_after_descriptor_close(path):
        try:
            original_unlink(path)
        except PermissionError:
            if os.path.basename(path).startswith("tmp"):
                return
            raise

    os.unlink = unlink_after_descriptor_close

    def restore_unlink():
        os.unlink = original_unlink

    config._lexora_restore_unlink = restore_unlink

    try:
        from gltest.direct.vm import VMContext
        original_warp = VMContext.warp

        def warp_and_sync(self, timestamp):
            original_warp(self, timestamp)
            _sync_direct_datetime(timestamp)

        VMContext.warp = warp_and_sync
        config._lexora_restore_warp = lambda: setattr(VMContext, "warp", original_warp)
    except ImportError:
        config._lexora_restore_warp = None


def pytest_sessionfinish(session, exitstatus):
    restore = getattr(session.config, "_lexora_restore_unlink", None)
    if restore:
        restore()
    restore_warp = getattr(session.config, "_lexora_restore_warp", None)
    if restore_warp:
        restore_warp()
