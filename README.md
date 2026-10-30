# Novaquest 🚀

**Every forgotten mission has a story waiting to be rediscovered.**

Novaquest is an interactive space exploration and digital storytelling experience that brings the history of space missions and space hardware to life. Explore the stories behind humanity's journeys beyond Earth, discover missions that have ended, and learn about the technology that helped us explore the unknown.

Built for **NASA Space Apps Challenge**, Novaquest aims to make space history more engaging, accessible, and exciting for the next generation of explorers.

## 🌌 What You Can Explore

- **Space Missions:** Discover missions that shaped our understanding of space.
- **Forgotten Stories:** Revisit missions and technologies whose journeys have come to an end.
- **Space Hardware:** Learn about the spacecraft and equipment that made exploration possible.
- **Interactive Discovery:** Explore space history through an engaging, accessible digital experience.
- **Learn Through Exploration:** Make complex space topics easier and more exciting to discover.

## 🎯 Our Mission

Space exploration is more than the discoveries we celebrate today. It is also the experiments, machines, missions, and ideas that came before them.

Novaquest brings these stories into focus, encouraging curiosity about the past while inspiring the explorers of tomorrow.

## 🛰️ Built For

- Space enthusiasts
- Students and young explorers
- Educators and curious learners
- Anyone interested in space missions and the history of exploration

## 🛠️ Technology

Novaquest is developed using web technologies and data-driven features to deliver an interactive learning experience.

## Architecture

The application is organized by product module. `frontend/src/NovaBase` contains the searchable mission and hardware catalogue, `frontend/src/NovaMap` contains the 3D solar-system experience, and `frontend/src/shared` contains the application header and shared pages. Backend catalogue routes, models, and ingestion services live under `backend/NovaBase`; database connections, initialization, schema, and environment settings live under `backend/shared`.

NovaQuest and NovaUser currently have no implemented gameplay, account, or authentication features; their existing home and settings pages remain shared placeholders. No new behavior or API endpoints were introduced during this organization.

The NovaBase mission sidebar is generated from mission records as destination → programme → mission. Mission rows retain the legacy `destination_category` field for compatibility and use `destination`, `programme`, and `classification_status` for hierarchy placement. Known catalogue entries have curated classifications; records without a confident match are kept visible under a provisional destination and **Standalone Missions**. The API adds these columns when upgrading an existing database.

## 🚀 Explore Novaquest

Discover the missions. Uncover the stories. Continue the quest.

---

*An independent educational project created for the NASA Space Apps Challenge. Novaquest is not an official NASA product and is not endorsed by NASA.*