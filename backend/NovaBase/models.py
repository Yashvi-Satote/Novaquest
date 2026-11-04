import json
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, ForeignKey, DateTime, Boolean,
    BigInteger, func, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from Shared.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    organization_type = Column(String(100), nullable=False, default="Space Agency")
    country = Column(String(100), nullable=True)
    official_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    spacecraft_list = relationship("Spacecraft", foreign_keys="Spacecraft.agency_id", back_populates="agency_org")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "organization_type": self.organization_type,
            "country": self.country,
            "official_url": self.official_url
        }


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    mission_name = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=True, index=True)  # Backward compat alias for mission_name
    slug = Column(String(255), nullable=False, unique=True, index=True)
    agency = Column(String(255), nullable=True)
    mission_type = Column(String(100), nullable=True)
    launch_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    destination = Column(String(100), nullable=True, default="Deep Space")
    destination_category = Column(String(100), nullable=True, default="Deep Space")
    mission_status = Column(String(100), nullable=False, default="Active", index=True)
    description = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    source_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    spacecraft_associations = relationship(
        "SpacecraftMission",
        back_populates="mission",
        cascade="all, delete-orphan"
    )
    spacecraft_items = relationship(
        "Spacecraft",
        secondary="spacecraft_missions",
        back_populates="missions",
        viewonly=True
    )
    map_objects = relationship(
        "MapObject",
        back_populates="mission",
        cascade="all, delete-orphan"
    )

    @property
    def hardware_items(self):
        """Backwards compatibility alias for hardware/spacecraft list."""
        return list(self.spacecraft_items)

    def to_dict(self, include_spacecraft=False, include_hardware_count=False):
        sc_list = self.spacecraft_items
        data = {
            "id": self.id,
            "mission_name": self.mission_name or self.name,
            "name": self.name or self.mission_name,
            "slug": self.slug,
            "agency": self.agency,
            "mission_type": self.mission_type,
            "launch_date": self.launch_date,
            "end_date": self.end_date,
            "destination": self.destination,
            "destination_category": self.destination_category or self.destination,
            "mission_status": self.mission_status,
            "description": self.description,
            "objectives": self.objectives,
            "source_url": self.source_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "spacecraft_count": len(sc_list)
        }
        if include_hardware_count:
            data["hardware_count"] = len(sc_list)
        if include_spacecraft:
            data["spacecraft"] = [sc.to_dict(full=False) for sc in sc_list]
        return data


class Spacecraft(Base):
    __tablename__ = "spacecraft"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    alternate_names = Column(Text, nullable=True)
    agency = Column(String(255), nullable=True)
    manufacturer = Column(String(255), nullable=True)
    launch_date = Column(String(50), nullable=True)
    spacecraft_type = Column(String(100), nullable=False, default="Spacecraft", index=True)
    description = Column(Text, nullable=True)
    operational_status = Column(String(100), nullable=False, default="Active", index=True)
    model_path = Column(String(500), nullable=True)
    model_format = Column(String(50), nullable=True, default="glb")
    thumbnail_path = Column(String(500), nullable=True)
    source_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Backward compatibility and rich UI fields
    display_name = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    destination = Column(String(100), nullable=True, default="Deep Space")
    destination_category = Column(String(100), nullable=True, default="Deep Space")
    object_type = Column(String(100), nullable=True, default="Spacecraft")
    short_description = Column(Text, nullable=True)
    educational_description = Column(Text, nullable=True)
    how_it_works = Column(Text, nullable=True)
    why_it_is_important = Column(Text, nullable=True)
    scientific_purpose = Column(Text, nullable=True)
    current_or_last_known_status = Column(Text, nullable=True)
    hardware_materials = Column(Text, nullable=True)
    eotss_url = Column(String(500), nullable=True)
    official_url = Column(String(500), nullable=True)
    verification_status = Column(String(100), nullable=False, default="Verified NASA Record")
    agency_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    agency_org = relationship("Organization", foreign_keys=[agency_id], back_populates="spacecraft_list")
    spacecraft_missions = relationship(
        "SpacecraftMission",
        back_populates="spacecraft",
        cascade="all, delete-orphan"
    )
    missions = relationship(
        "Mission",
        secondary="spacecraft_missions",
        back_populates="spacecraft_items",
        viewonly=True
    )
    map_objects = relationship(
        "MapObject",
        back_populates="spacecraft",
        cascade="all, delete-orphan"
    )
    model_3d = relationship("Model3D", uselist=False, back_populates="spacecraft", cascade="all, delete-orphan")
    aliases = relationship("SpacecraftAlias", back_populates="spacecraft", cascade="all, delete-orphan")
    keywords = relationship("SpacecraftKeyword", back_populates="spacecraft", cascade="all, delete-orphan")
    images = relationship("SpacecraftImage", back_populates="spacecraft", cascade="all, delete-orphan")
    sources = relationship("SpacecraftSource", back_populates="spacecraft", cascade="all, delete-orphan")

    @property
    def primary_mission(self):
        return self.missions[0] if self.missions else None

    @property
    def primary_mission_id(self):
        return self.missions[0].id if self.missions else None

    @property
    def mission_id(self):
        return self.primary_mission_id

    @property
    def mission_name(self):
        return self.missions[0].mission_name if self.missions else None

    def to_dict(self, full=False):
        missions_list = [
            {
                "id": m.id,
                "mission_name": m.mission_name or m.name,
                "name": m.name or m.mission_name,
                "slug": m.slug,
                "destination": m.destination,
                "mission_status": m.mission_status
            }
            for m in self.missions
        ]

        active_m = self.primary_mission
        data = {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "alternate_names": self.alternate_names,
            "agency": self.agency,
            "manufacturer": self.manufacturer,
            "launch_date": self.launch_date,
            "spacecraft_type": self.spacecraft_type or self.object_type or "Spacecraft",
            "object_type": self.object_type or self.spacecraft_type or "Spacecraft",
            "description": self.description or self.short_description,
            "operational_status": self.operational_status,
            "model_path": self.model_path,
            "model_format": self.model_format or "glb",
            "thumbnail_path": self.thumbnail_path,
            "source_url": self.source_url or self.official_url,
            "display_name": self.display_name or self.name,
            "full_name": self.full_name or self.display_name or self.name,
            "destination": self.destination,
            "destination_category": self.destination_category or self.destination,
            "primary_mission_id": active_m.id if active_m else None,
            "mission_id": active_m.id if active_m else None,
            "mission_name": active_m.mission_name if active_m else None,
            "missions": missions_list,
            "has_3d_model": bool(self.model_path),
            "model_3d": self.model_3d.to_dict() if self.model_3d else {
                "glb_path": self.model_path,
                "primary_format": self.model_format or "glb",
                "is_available": bool(self.model_path)
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "official_url": self.official_url or self.source_url,
            "eotss_url": self.eotss_url,
            "short_description": self.short_description or self.description
        }

        if full:
            data.update({
                "educational_description": self.educational_description or self.description,
                "how_it_works": self.how_it_works,
                "why_it_is_important": self.why_it_is_important,
                "scientific_purpose": self.scientific_purpose,
                "current_or_last_known_status": self.current_or_last_known_status,
                "hardware_materials": self.hardware_materials,
                "verification_status": self.verification_status,
                "aliases": [a.to_dict() for a in self.aliases],
                "images": [img.to_dict() for img in self.images],
                "sources": [s.to_dict() for s in self.sources]
            })
        return data


class SpacecraftMission(Base):
    __tablename__ = "spacecraft_missions"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False, index=True)
    mission_role = Column(String(100), nullable=False, default="Primary Spacecraft")
    relationship_description = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("mission_id", "spacecraft_id", name="uq_spacecraft_mission"),
    )

    spacecraft = relationship("Spacecraft", back_populates="spacecraft_missions")
    mission = relationship("Mission", back_populates="spacecraft_associations")

    def to_dict(self):
        return {
            "id": self.id,
            "spacecraft_id": self.spacecraft_id,
            "mission_id": self.mission_id,
            "mission_role": self.mission_role,
            "relationship_description": self.relationship_description
        }


class MapObject(Base):
    __tablename__ = "map_objects"

    id = Column(Integer, primary_key=True, index=True)
    object_name = Column(String(255), nullable=False, index=True)
    object_type = Column(String(100), nullable=False, index=True)  # planet, moon, spacecraft, satellite, space_telescope, lander, rover, probe
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="SET NULL"), nullable=True, index=True)
    parent_body = Column(String(100), nullable=True)  # Sun, Earth, Mars, Jupiter, Saturn, etc.
    position_source = Column(String(100), nullable=True, default="Keplerian Ephemeris / Analytic Position")
    position_data = Column(Text, nullable=True)  # JSON representation of coordinates / orbital parameters
    model_path = Column(String(500), nullable=True)
    visibility_status = Column(String(50), nullable=False, default="visible", index=True)

    spacecraft = relationship("Spacecraft", back_populates="map_objects")
    mission = relationship("Mission", back_populates="map_objects")

    def to_dict(self):
        pos = {}
        if self.position_data:
            try:
                pos = json.loads(self.position_data)
            except Exception:
                pos = {}

        sc_dict = self.spacecraft.to_dict(full=False) if self.spacecraft else None
        m_dict = self.mission.to_dict(include_spacecraft=False) if self.mission else None

        return {
            "id": self.id,
            "object_name": self.object_name,
            "object_type": self.object_type,
            "spacecraft_id": self.spacecraft_id,
            "mission_id": self.mission_id,
            "parent_body": self.parent_body,
            "position_source": self.position_source,
            "position_data": pos,
            "model_path": self.model_path,
            "visibility_status": self.visibility_status,
            "spacecraft": sc_dict,
            "mission": m_dict
        }


class Model3D(Base):
    __tablename__ = "models_3d"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    model_name = Column(String(255), nullable=False, unique=True, index=True)
    folder_name = Column(String(255), nullable=False)
    primary_format = Column(String(50), nullable=False, default="glb")
    glb_filename = Column(String(255), nullable=False)
    glb_path = Column(String(500), nullable=False)
    gltf_filename = Column(String(255), nullable=False)
    gltf_path = Column(String(500), nullable=False)
    bin_filename = Column(String(255), nullable=True)
    bin_path = Column(String(500), nullable=True)
    texture_files = Column(Text, nullable=True)
    texture_count = Column(Integer, default=0)
    file_size_bytes = Column(BigInteger, default=0)
    is_available = Column(Boolean, default=True, index=True)
    provenance = Column(String(255), nullable=False, default="NASA Eyes on the Solar System (Official Public Domain)")
    source_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    spacecraft = relationship("Spacecraft", back_populates="model_3d")

    def to_dict(self):
        return {
            "id": self.id,
            "spacecraft_id": self.spacecraft_id,
            "model_name": self.model_name,
            "folder_name": self.folder_name,
            "primary_format": self.primary_format,
            "glb_filename": self.glb_filename,
            "glb_path": self.glb_path,
            "gltf_filename": self.gltf_filename,
            "gltf_path": self.gltf_path,
            "bin_filename": self.bin_filename,
            "bin_path": self.bin_path,
            "texture_count": self.texture_count,
            "file_size_bytes": self.file_size_bytes,
            "is_available": self.is_available,
            "provenance": self.provenance,
            "source_url": self.source_url
        }


class SpacecraftAlias(Base):
    __tablename__ = "spacecraft_aliases"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    alias = Column(String(255), nullable=False, index=True)
    alias_type = Column(String(50), nullable=False, default="Alternate Name")

    spacecraft = relationship("Spacecraft", back_populates="aliases")

    def to_dict(self):
        return {
            "id": self.id,
            "spacecraft_id": self.spacecraft_id,
            "alias": self.alias,
            "alias_type": self.alias_type
        }


class SpacecraftKeyword(Base):
    __tablename__ = "spacecraft_keywords"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    keyword = Column(String(100), nullable=False, index=True)

    spacecraft = relationship("Spacecraft", back_populates="keywords")


class SpacecraftImage(Base):
    __tablename__ = "spacecraft_images"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False, default="Photo")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(1000), nullable=False)
    source_url = Column(String(1000), nullable=False)
    attribution = Column(String(255), nullable=False)
    publication_date = Column(String(50), nullable=True)
    thumbnail_url = Column(String(1000), nullable=True)
    kind = Column(String(50), default="photo")
    credit = Column(String(255), nullable=True)
    license = Column(String(255), nullable=True)
    source_id = Column(Integer, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    sort_order = Column(Integer, default=0)

    spacecraft = relationship("Spacecraft", back_populates="images")

    def to_dict(self):
        return {
            "id": self.id,
            "spacecraft_id": self.spacecraft_id,
            "item_type": self.item_type,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "thumbnail_url": self.thumbnail_url or self.image_url,
            "source_url": self.source_url,
            "attribution": self.credit or self.attribution,
            "credit": self.credit or self.attribution,
            "license": self.license,
            "kind": self.kind or "photo",
            "width": self.width,
            "height": self.height,
            "sort_order": self.sort_order,
            "publication_date": self.publication_date
        }


class SpacecraftSource(Base):
    __tablename__ = "spacecraft_sources"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    source_name = Column(String(255), nullable=False)
    source_url = Column(String(1000), nullable=False)
    source_type = Column(String(100), nullable=False)
    evidence_notes = Column(Text, nullable=True)
    last_checked_at = Column(String(50), nullable=True)
    label = Column(String(255), nullable=True)
    url = Column(String(1000), nullable=True)
    verified = Column(Boolean, default=False)
    http_status = Column(Integer, nullable=True)
    last_checked = Column(DateTime, nullable=True)
    source_id = Column(Integer, nullable=True)

    spacecraft = relationship("Spacecraft", back_populates="sources")

    def to_dict(self):
        return {
            "id": self.id,
            "spacecraft_id": self.spacecraft_id,
            "source_name": self.source_name,
            "label": self.label or self.source_name,
            "source_url": self.source_url,
            "url": self.url or self.source_url,
            "source_type": self.source_type,
            "evidence_notes": self.evidence_notes,
            "verified": bool(self.verified),
            "http_status": self.http_status,
            "last_checked_at": self.last_checked_at,
            "last_checked": self.last_checked.isoformat() if self.last_checked else None
        }


# =========================================================================
# NOVABASE 10-SECTION MODELS
# =========================================================================

class SpacecraftContent(Base):
    __tablename__ = "spacecraft_content"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    section_key = Column(String(50), nullable=False, index=True)
    body_text = Column(Text, nullable=True)
    source_id = Column(Integer, ForeignKey("spacecraft_sources.id", ondelete="SET NULL"), nullable=True)
    license = Column(String(100), nullable=True)
    attribution = Column(String(500), nullable=True)
    revision_id = Column(String(50), nullable=True)
    page_url = Column(String(1000), nullable=True)
    fetched_at = Column(DateTime, nullable=True)
    completeness = Column(String(20), nullable=False, default="missing")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    spacecraft = relationship("Spacecraft", back_populates="content_blocks")

    __table_args__ = (
        UniqueConstraint("spacecraft_id", "section_key", name="uq_spacecraft_content"),
    )

    def to_dict(self):
        return {
            "section_key": self.section_key,
            "body_text": self.body_text,
            "source_id": self.source_id,
            "license": self.license,
            "attribution": self.attribution,
            "revision_id": self.revision_id,
            "page_url": self.page_url,
            "fetched_at": self.fetched_at.isoformat() if self.fetched_at else None,
            "completeness": self.completeness
        }


class SpacecraftPart(Base):
    __tablename__ = "spacecraft_parts"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    part_name = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)

    spacecraft = relationship("Spacecraft", back_populates="parts")

    __table_args__ = (
        UniqueConstraint("spacecraft_id", "part_name", name="uq_spacecraft_part"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "part_name": self.part_name,
            "purpose": self.purpose,
            "sort_order": self.sort_order
        }


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    event_date = Column(String(50), nullable=True)
    event_date_precision = Column(String(20), default="day")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String(50), default="event")
    source_id = Column(Integer, ForeignKey("spacecraft_sources.id", ondelete="SET NULL"), nullable=True)
    sort_order = Column(Integer, default=0)

    spacecraft = relationship("Spacecraft", back_populates="timeline")

    __table_args__ = (
        UniqueConstraint("spacecraft_id", "event_date", "title", name="uq_timeline_event"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "event_date": self.event_date,
            "event_date_precision": self.event_date_precision,
            "title": self.title,
            "description": self.description,
            "event_type": self.event_type,
            "source_id": self.source_id,
            "sort_order": self.sort_order
        }


class SpacecraftStakeholder(Base):
    __tablename__ = "spacecraft_stakeholders"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(100), nullable=False)

    spacecraft = relationship("Spacecraft", back_populates="stakeholder_links")
    organization = relationship("Organization")

    __table_args__ = (
        UniqueConstraint("spacecraft_id", "organization_id", "role", name="uq_spacecraft_stakeholder"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "name": self.organization.name if self.organization else None,
            "role": self.role,
            "country": self.organization.country if self.organization else None,
            "url": self.organization.official_url if self.organization else None,
            "org_type": self.organization.organization_type if self.organization else None
        }


class SpacecraftModel(Base):
    __tablename__ = "spacecraft_models"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String(1000), nullable=True)
    download_url = Column(String(1500), nullable=True)
    format = Column(String(20), nullable=True)
    size_bytes = Column(BigInteger, nullable=True)
    web_ready = Column(Boolean, default=False)
    provider = Column(String(100), default="NASA 3D Resources")
    license = Column(String(200), default="NASA 3D resources are free to use without copyright")
    viewer_url = Column(String(1000), nullable=True)
    status = Column(String(30), nullable=False, default="ok")
    created_at = Column(DateTime, server_default=func.now())

    spacecraft = relationship("Spacecraft", back_populates="models")

    __table_args__ = (
        UniqueConstraint("spacecraft_id", "download_url", name="uq_spacecraft_model_url"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "file_path": self.file_path,
            "download_url": self.download_url,
            "format": self.format,
            "size_bytes": self.size_bytes,
            "web_ready": bool(self.web_ready),
            "provider": self.provider,
            "license": self.license,
            "viewer_url": self.viewer_url,
            "status": self.status
        }


class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False, unique=True, index=True)
    affiliation = Column(String(255), nullable=True)
    bio_short = Column(Text, nullable=True)
    wiki_url = Column(String(1000), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    mission_links = relationship("SpacecraftPerson", back_populates="person", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "affiliation": self.affiliation,
            "bio_short": self.bio_short,
            "wiki_url": self.wiki_url
        }


class SpacecraftPerson(Base):
    __tablename__ = "spacecraft_people"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=False, index=True)
    role_on_mission = Column(String(255), nullable=True)
    rank_order = Column(Integer, nullable=False)
    source_id = Column(Integer, ForeignKey("spacecraft_sources.id", ondelete="SET NULL"), nullable=True)

    spacecraft = relationship("Spacecraft", back_populates="people_links")
    person = relationship("Person", back_populates="mission_links")

    __table_args__ = (
        UniqueConstraint("spacecraft_id", "rank_order", name="uq_spacecraft_person_rank"),
        CheckConstraint("rank_order BETWEEN 1 AND 10", name="ck_spacecraft_person_rank"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "rank_order": self.rank_order,
            "full_name": self.person.full_name if self.person else None,
            "role_on_mission": self.role_on_mission,
            "affiliation": self.person.affiliation if self.person else None,
            "wiki_url": self.person.wiki_url if self.person else None
        }


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    api_name = Column(String(100), nullable=False, unique=True)
    base_url = Column(String(1000), nullable=False)
    license = Column(String(200), nullable=True)
    attribution = Column(Text, nullable=True)
    last_checked = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "api_name": self.api_name,
            "base_url": self.base_url,
            "license": self.license,
            "attribution": self.attribution,
            "last_checked": self.last_checked.isoformat() if self.last_checked else None
        }


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(100), nullable=False)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False, default="running")
    rows_inserted = Column(Integer, default=0)
    rows_updated = Column(Integer, default=0)
    errors = Column(Text, nullable=True)
    details = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "provider": self.provider,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "status": self.status,
            "rows_inserted": self.rows_inserted,
            "rows_updated": self.rows_updated,
            "errors": self.errors
        }


class SchemaVersion(Base):
    __tablename__ = "schema_version"

    version = Column(Integer, primary_key=True)
    description = Column(String(255), nullable=False)
    applied_at = Column(DateTime, server_default=func.now())


# =========================================================================
# BACKWARD COMPATIBILITY ALIASES
# Ensure existing code referencing Hardware, HardwareAlias, etc. works seamlessly.
# =========================================================================
Hardware = Spacecraft
HardwareAlias = SpacecraftAlias
HardwareImage = SpacecraftImage
HardwareSource = SpacecraftSource
MissionSpacecraft = SpacecraftMission
