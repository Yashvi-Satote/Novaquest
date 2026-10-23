from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship
from database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    organization_type = Column(String(100), nullable=False, default="Space Agency") # Space Agency, Manufacturer, Operator, Launch Provider
    country = Column(String(100), nullable=True)
    official_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    manufactured_hardware = relationship("Hardware", foreign_keys="Hardware.manufacturer_id", back_populates="manufacturer")
    operated_hardware = relationship("Hardware", foreign_keys="Hardware.operator_id", back_populates="operator")
    agency_hardware = relationship("Hardware", foreign_keys="Hardware.mission_agency_id", back_populates="mission_agency")

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
    destination_category = Column(String(100), nullable=False, index=True) # Mars, Moon, Deep Space, Earth Orbit
    launch_date = Column(String(50), nullable=True)
    mission_end_date = Column(String(50), nullable=True)
    mission_status = Column(String(100), nullable=False, default="Active") # Active, Completed, Extended, Decommissioned
    description = Column(Text, nullable=True)
    official_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    hardware_items = relationship("Hardware", back_populates="mission", cascade="all, delete-orphan")

    def to_dict(self, include_hardware_count=False):
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
            data["hardware_count"] = len(self.hardware_items)
        return data

class Hardware(Base):
    __tablename__ = "hardware"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    
    # Foreign Keys
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False, index=True)
    manufacturer_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    operator_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    mission_agency_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    launch_provider_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)

    # Core attributes
    object_type = Column(String(100), nullable=False, index=True) # Lander, Rover, Orbiter, Flyby Probe, Lunar Module, Lunar Roving Vehicle, Satellite, Space Station, Rocket Body, Orbital Debris
    destination = Column(String(100), nullable=False, index=True) # Mars, Moon, Deep Space, Earth Orbit
    operational_status = Column(String(100), nullable=False, index=True) # "Active / operational", "Inactive / decommissioned", "Unknown / disputed"
    physical_status = Column(String(100), nullable=True) # Intact on surface, In orbit, Impacted surface, Flyby trajectory, Escaping Solar System, Decayed/Reentered
    
    # Timeline
    launch_date = Column(String(50), nullable=True)
    decommission_date = Column(String(50), nullable=True)
    landing_date = Column(String(50), nullable=True)
    
    # Coordinates / Location
    location_description = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Descriptions & Educational sections (Targeted for school students 10-15)
    short_description = Column(Text, nullable=False)
    educational_description = Column(Text, nullable=False) # Answers: What is this object? Why sent? What did it do? What scientists learned? Where is it now?
    how_it_works = Column(Text, nullable=False) # Explains scientific and mechanical operation
    why_it_is_important = Column(Text, nullable=False) # Historical & scientific significance
    scientific_purpose = Column(Text, nullable=False)
    current_or_last_known_status = Column(Text, nullable=False) # Detailed verifiable current state
    hardware_materials = Column(Text, nullable=True)

    # Official link & metadata
    official_url = Column(String(500), nullable=False)
    verification_status = Column(String(100), nullable=False, default="Verified from NASA/JPL Records")
    last_verified_at = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    mission = relationship("Mission", back_populates="hardware_items")
    manufacturer = relationship("Organization", foreign_keys=[manufacturer_id], back_populates="manufactured_hardware")
    operator = relationship("Organization", foreign_keys=[operator_id], back_populates="operated_hardware")
    mission_agency = relationship("Organization", foreign_keys=[mission_agency_id], back_populates="agency_hardware")
    launch_provider = relationship("Organization", foreign_keys=[launch_provider_id])

    aliases = relationship("HardwareAlias", back_populates="hardware", cascade="all, delete-orphan")
    keywords = relationship("HardwareKeyword", back_populates="hardware", cascade="all, delete-orphan")
    images = relationship("HardwareImage", back_populates="hardware", cascade="all, delete-orphan")
    sources = relationship("HardwareSource", back_populates="hardware", cascade="all, delete-orphan")

    def to_dict(self, full=False):
        # Determine responsible company/org name for concise display
        primary_org = (
            self.operator.name if self.operator else
            (self.mission_agency.name if self.mission_agency else
            (self.manufacturer.name if self.manufacturer else "Unknown"))
        )

        data = {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "mission_id": self.mission_id,
            "mission_name": self.mission.name if self.mission else None,
            "destination_category": self.mission.destination_category if self.mission else self.destination,
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
            "verification_status": self.verification_status,
            "last_verified_at": self.last_verified_at,
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

# Additional composite indexes for optimized multi-column filtering
Index("idx_hardware_search_composite", Hardware.destination, Hardware.operational_status, Hardware.object_type)

class HardwareAlias(Base):
    __tablename__ = "hardware_aliases"

    id = Column(Integer, primary_key=True, index=True)
    hardware_id = Column(Integer, ForeignKey("hardware.id", ondelete="CASCADE"), nullable=False, index=True)
    alias = Column(String(255), nullable=False, index=True)
    alias_type = Column(String(50), nullable=False, default="Alternate Name") # Catalog ID, Code Name, Acronym, Alternate Name

    hardware = relationship("Hardware", back_populates="aliases")

    def to_dict(self):
        return {
            "id": self.id,
            "alias": self.alias,
            "alias_type": self.alias_type
        }

class HardwareKeyword(Base):
    __tablename__ = "hardware_keywords"

    id = Column(Integer, primary_key=True, index=True)
    hardware_id = Column(Integer, ForeignKey("hardware.id", ondelete="CASCADE"), nullable=False, index=True)
    keyword = Column(String(100), nullable=False, index=True)

    hardware = relationship("Hardware", back_populates="keywords")

class HardwareImage(Base):
    __tablename__ = "hardware_images"

    id = Column(Integer, primary_key=True, index=True)
    hardware_id = Column(Integer, ForeignKey("hardware.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False, default="Photo") # Photo, Diagram, Data Visualization, Map, Schematic
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(1000), nullable=False)
    source_url = Column(String(1000), nullable=False)
    attribution = Column(String(255), nullable=False)
    publication_date = Column(String(50), nullable=True)

    hardware = relationship("Hardware", back_populates="images")

    def to_dict(self):
        return {
            "id": self.id,
            "hardware_id": self.hardware_id,
            "item_type": self.item_type,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "source_url": self.source_url,
            "attribution": self.attribution,
            "publication_date": self.publication_date
        }

class HardwareSource(Base):
    __tablename__ = "hardware_sources"

    id = Column(Integer, primary_key=True, index=True)
    hardware_id = Column(Integer, ForeignKey("hardware.id", ondelete="CASCADE"), nullable=False, index=True)
    source_name = Column(String(255), nullable=False)
    source_url = Column(String(1000), nullable=False)
    source_type = Column(String(100), nullable=False) # Official Mission Website, Science Data Archive, Technical Documentation, Image Archive
    evidence_notes = Column(Text, nullable=True)
    last_checked_at = Column(String(50), nullable=True)

    hardware = relationship("Hardware", back_populates="sources")

    def to_dict(self):
        return {
            "id": self.id,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "source_type": self.source_type,
            "evidence_notes": self.evidence_notes,
            "last_checked_at": self.last_checked_at
        }
