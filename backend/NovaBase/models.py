from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Boolean, BigInteger, func, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from Shared.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    organization_type = Column(String(100), nullable=False, default="Space Agency") # Space Agency, Research Center, Commercial Manufacturer, etc.
    country = Column(String(100), nullable=True)
    official_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    manufactured_spacecraft = relationship("Spacecraft", foreign_keys="Spacecraft.manufacturer_id", back_populates="manufacturer")
    operated_spacecraft = relationship("Spacecraft", foreign_keys="Spacecraft.operator_id", back_populates="operator")
    agency_spacecraft = relationship("Spacecraft", foreign_keys="Spacecraft.mission_agency_id", back_populates="mission_agency")

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
    name = Column(String(255), nullable=False, unique=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    destination_category = Column(String(100), nullable=False, index=True) # Mars, Moon, Deep Space, Earth Orbit, Heliophysics, Asteroids & Comets
    launch_date = Column(String(50), nullable=True)
    mission_end_date = Column(String(50), nullable=True)
    mission_status = Column(String(100), nullable=False, default="Active") # Active, Completed, Extended, Decommissioned
    description = Column(Text, nullable=True)
    official_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    spacecraft_associations = relationship("MissionSpacecraft", back_populates="mission", cascade="all, delete-orphan")
    spacecraft_items = relationship("Spacecraft", secondary="mission_spacecraft", back_populates="missions", viewonly=True)
    primary_spacecraft_items = relationship("Spacecraft", foreign_keys="Spacecraft.primary_mission_id", back_populates="primary_mission")

    @property
    def hardware_items(self):
        """Backwards compatibility alias for hardware list."""
        # Combines associated spacecraft
        items = list(self.spacecraft_items)
        for ps in self.primary_spacecraft_items:
            if ps not in items:
                items.append(ps)
        return items

    def to_dict(self, include_hardware_count=False, include_spacecraft=False):
        spacecraft_list = self.hardware_items
        data = {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "destination_category": self.destination_category,
            "launch_date": self.launch_date,
            "mission_end_date": self.mission_end_date,
            "mission_status": self.mission_status,
            "description": self.description,
            "official_url": self.official_url
        }
        if include_hardware_count:
            data["hardware_count"] = len(spacecraft_list)
            data["spacecraft_count"] = len(spacecraft_list)
        if include_spacecraft:
            data["spacecraft"] = [sc.to_dict(full=False) for sc in spacecraft_list]
        return data


class Spacecraft(Base):
    __tablename__ = "spacecraft"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True) # Canonical source ID / model identifier
    slug = Column(String(255), nullable=False, unique=True, index=True) # Web routing slug
    display_name = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # Classification
    object_type = Column(String(100), nullable=False, default="Spacecraft", index=True) # Orbiter, Rover, Lander, Space Telescope, Flyby Probe, Satellite, etc.
    destination_category = Column(String(100), nullable=False, default="Deep Space", index=True) # Deep Space, Mars, Moon, Earth Orbit, Heliophysics, Asteroids & Comets
    destination = Column(String(100), nullable=False, default="Deep Space", index=True)
    operational_status = Column(String(100), nullable=False, default="Active / operational", index=True)
    physical_status = Column(String(100), nullable=True)
    
    # Timeline
    launch_date = Column(String(50), nullable=True)
    decommission_date = Column(String(50), nullable=True)
    landing_date = Column(String(50), nullable=True)
    
    # Location
    location_description = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Narrative & Educational descriptions
    short_description = Column(Text, nullable=False)
    educational_description = Column(Text, nullable=False)
    how_it_works = Column(Text, nullable=False)
    why_it_is_important = Column(Text, nullable=False)
    scientific_purpose = Column(Text, nullable=False)
    current_or_last_known_status = Column(Text, nullable=False)
    hardware_materials = Column(Text, nullable=True)

    # URLs & Verification
    official_url = Column(String(500), nullable=False)
    eotss_url = Column(String(500), nullable=True)
    verification_status = Column(String(100), nullable=False, default="Verified from NASA/JPL Records")
    last_verified_at = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Foreign Keys
    primary_mission_id = Column(Integer, ForeignKey("missions.id", ondelete="SET NULL"), nullable=True, index=True)
    manufacturer_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    operator_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    mission_agency_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    launch_provider_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    primary_mission = relationship("Mission", foreign_keys=[primary_mission_id], back_populates="primary_spacecraft_items")
    mission_associations = relationship("MissionSpacecraft", back_populates="spacecraft", cascade="all, delete-orphan", overlaps="missions,spacecraft_items")
    missions = relationship("Mission", secondary="mission_spacecraft", back_populates="spacecraft_items", overlaps="mission_associations,spacecraft_associations")

    model_3d = relationship("Model3D", uselist=False, back_populates="spacecraft", cascade="all, delete-orphan")
    manufacturer = relationship("Organization", foreign_keys=[manufacturer_id], back_populates="manufactured_spacecraft")
    operator = relationship("Organization", foreign_keys=[operator_id], back_populates="operated_spacecraft")
    mission_agency = relationship("Organization", foreign_keys=[mission_agency_id], back_populates="agency_spacecraft")
    launch_provider = relationship("Organization", foreign_keys=[launch_provider_id])

    aliases = relationship("SpacecraftAlias", back_populates="spacecraft", cascade="all, delete-orphan")
    keywords = relationship("SpacecraftKeyword", back_populates="spacecraft", cascade="all, delete-orphan")
    images = relationship("SpacecraftImage", back_populates="spacecraft", cascade="all, delete-orphan")
    sources = relationship("SpacecraftSource", back_populates="spacecraft", cascade="all, delete-orphan")

    # Backwards compatibility properties for legacy code expecting `mission_id` and `mission`
    @property
    def mission_id(self):
        if self.primary_mission_id:
            return self.primary_mission_id
        if self.missions:
            return self.missions[0].id
        return None

    @property
    def mission(self):
        if self.primary_mission:
            return self.primary_mission
        if self.missions:
            return self.missions[0]
        return None

    def to_dict(self, full=False):
        primary_org = (
            self.operator.name if self.operator else
            (self.mission_agency.name if self.mission_agency else
            (self.manufacturer.name if self.manufacturer else "NASA"))
        )

        all_missions_list = [
            {"id": m.id, "name": m.name, "slug": m.slug, "destination_category": m.destination_category}
            for m in self.missions
        ]
        if self.primary_mission and self.primary_mission not in self.missions:
            all_missions_list.insert(0, {
                "id": self.primary_mission.id,
                "name": self.primary_mission.name,
                "slug": self.primary_mission.slug,
                "destination_category": self.primary_mission.destination_category
            })

        active_mission = self.mission
        mission_name = active_mission.name if active_mission else None
        mission_id = active_mission.id if active_mission else None

        model_dict = self.model_3d.to_dict() if self.model_3d else None

        data = {
            "id": self.id,
            "name": self.display_name or self.name,
            "identifier": self.name,
            "slug": self.slug,
            "display_name": self.display_name,
            "full_name": self.full_name,
            "mission_id": mission_id,
            "mission_name": mission_name,
            "missions": all_missions_list,
            "destination_category": self.destination_category,
            "destination": self.destination,
            "object_type": self.object_type,
            "operational_status": self.operational_status,
            "physical_status": self.physical_status,
            "primary_organization": primary_org,
            "manufacturer": self.manufacturer.to_dict() if self.manufacturer else None,
            "operator": self.operator.to_dict() if self.operator else None,
            "mission_agency": self.mission_agency.to_dict() if self.mission_agency else None,
            "launch_provider": self.launch_provider.to_dict() if self.launch_provider else None,
            "launch_date": self.launch_date,
            "decommission_date": self.decommission_date,
            "landing_date": self.landing_date,
            "location_description": self.location_description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "short_description": self.short_description,
            "official_url": self.official_url,
            "eotss_url": self.eotss_url,
            "verification_status": self.verification_status,
            "last_verified_at": self.last_verified_at,
            "model_3d": model_dict,
            "has_3d_model": model_dict is not None and model_dict.get("is_available", False),
            "image_count": len(self.images) if self.images else 0,
            "preview_image": self.images[0].image_url if self.images else None,
            "preview_image_caption": self.images[0].title if self.images else None
        }

        if full:
            data.update({
                "educational_description": self.educational_description,
                "how_it_works": self.how_it_works,
                "why_it_is_important": self.why_it_is_important,
                "scientific_purpose": self.scientific_purpose,
                "current_or_last_known_status": self.current_or_last_known_status,
                "hardware_materials": self.hardware_materials,
                "aliases": [a.to_dict() for a in self.aliases],
                "keywords": [k.keyword for k in self.keywords],
                "images": [img.to_dict() for img in self.images],
                "sources": [s.to_dict() for s in self.sources]
            })

        return data


class Model3D(Base):
    __tablename__ = "models_3d"

    id = Column(Integer, primary_key=True, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    model_name = Column(String(255), nullable=False, unique=True, index=True)
    folder_name = Column(String(255), nullable=False)
    primary_format = Column(String(50), nullable=False, default="glb") # glb, gltf
    glb_filename = Column(String(255), nullable=False)
    glb_path = Column(String(500), nullable=False)
    gltf_filename = Column(String(255), nullable=False)
    gltf_path = Column(String(500), nullable=False)
    bin_filename = Column(String(255), nullable=True)
    bin_path = Column(String(500), nullable=True)
    texture_files = Column(Text, nullable=True) # JSON array of texture filenames
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


class MissionSpacecraft(Base):
    __tablename__ = "mission_spacecraft"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False, index=True)
    spacecraft_id = Column(Integer, ForeignKey("spacecraft.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(100), nullable=False, default="Primary Spacecraft") # Primary Spacecraft, Lander, Rover, Orbiter, Flyby Probe, Cruise Stage
    notes = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("mission_id", "spacecraft_id", name="uq_mission_spacecraft"),
    )

    mission = relationship("Mission", back_populates="spacecraft_associations", overlaps="missions,spacecraft_items")
    spacecraft = relationship("Spacecraft", back_populates="mission_associations", overlaps="missions,spacecraft_items")

    def to_dict(self):
        return {
            "id": self.id,
            "mission_id": self.mission_id,
            "spacecraft_id": self.spacecraft_id,
            "role": self.role,
            "notes": self.notes
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

    spacecraft = relationship("Spacecraft", back_populates="images")

    def to_dict(self):
        return {
            "id": self.id,
            "spacecraft_id": self.spacecraft_id,
            "item_type": self.item_type,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "source_url": self.source_url,
            "attribution": self.attribution,
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

    spacecraft = relationship("Spacecraft", back_populates="sources")

    def to_dict(self):
        return {
            "id": self.id,
            "spacecraft_id": self.spacecraft_id,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "source_type": self.source_type,
            "evidence_notes": self.evidence_notes,
            "last_checked_at": self.last_checked_at
        }


# =========================================================================
# BACKWARD COMPATIBILITY ALIASES
# Ensure existing code referencing Hardware, HardwareAlias, etc. works seamlessly.
# =========================================================================
Hardware = Spacecraft
HardwareAlias = SpacecraftAlias
HardwareKeyword = SpacecraftKeyword
HardwareImage = SpacecraftImage
HardwareSource = SpacecraftSource
