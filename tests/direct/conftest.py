"""Windows compatibility shim for genlayer-test Direct Mode."""
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
    config._lexora_restore_unlink = lambda: setattr(os, "unlink", original_unlink)

def pytest_sessionfinish(session, exitstatus):
    restore = getattr(session.config, "_lexora_restore_unlink", None)
    if restore:
        restore()
