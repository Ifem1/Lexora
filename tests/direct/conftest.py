"""Windows compatibility shim for genlayer-test 0.29.2 Direct Mode.

The upstream loader unlinks its stdin backing file while Windows still holds
the duplicated descriptor. Linux and CI do not need this workaround.
"""

import os


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


def pytest_sessionfinish(session, exitstatus):
    restore = getattr(session.config, "_lexora_restore_unlink", None)
    if restore:
        restore()
