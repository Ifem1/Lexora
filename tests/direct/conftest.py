"""Windows compatibility shim for genlayer-test 0.29.2 Direct Mode.

The upstream loader unlinks its stdin backing file while Windows still holds
the duplicated descriptor. Linux and CI do not need this workaround.
"""

import os


def _sync_direct_datetime(timestamp):
    """Keep Direct Mode's loaded message datetime aligned with warp().

    Production GenVM supplies message_raw["datetime"] per transaction. In
    genlayer-test 0.29.2, warp updates the VM field but not the already-loaded
    message object, so this compatibility shim mirrors only that missing update.
    """
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
        from gltest.direct.vm import DirectVM
        original_warp = DirectVM.warp

        def warp_and_sync(self, timestamp):
            original_warp(self, timestamp)
            _sync_direct_datetime(timestamp)

        DirectVM.warp = warp_and_sync
        config._lexora_restore_warp = lambda: setattr(DirectVM, "warp", original_warp)
    except ImportError:
        config._lexora_restore_warp = None


def pytest_sessionfinish(session, exitstatus):
    restore = getattr(session.config, "_lexora_restore_unlink", None)
    if restore:
        restore()
    restore_warp = getattr(session.config, "_lexora_restore_warp", None)
    if restore_warp:
        restore_warp()
