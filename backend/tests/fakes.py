"""Network-free provider doubles for tests."""
from __future__ import annotations


class FakeWikipedia:
    def __init__(self, wiki):
        self.wiki = wiki

    def fetch_mission(self, mission):
        return self.wiki

    def lookup_person(self, full_name):
        return None


class FakeNasa3D:
    def find_models(self, *args, **kwargs):
        return []
