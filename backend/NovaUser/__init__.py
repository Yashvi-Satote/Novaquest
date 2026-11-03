"""NovaUser authentication package.

The package is intentionally self-contained so that email/password JWT
authentication can be developed and tested independently of the rest of the
application.  ``init_novauser`` registers the authentication blueprint on an
existing Flask application without changing the behaviour of other modules.
"""

from .app import create_app, init_novauser

__all__ = ["create_app", "init_novauser"]
