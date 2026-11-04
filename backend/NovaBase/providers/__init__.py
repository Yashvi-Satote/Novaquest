"""Pluggable data providers for NovaBase ingestion."""
from .base import BaseProvider, ProviderError
from .wikipedia import WikipediaProvider
from .nasa_3d import Nasa3DProvider

__all__ = ["BaseProvider", "ProviderError", "WikipediaProvider", "Nasa3DProvider"]
