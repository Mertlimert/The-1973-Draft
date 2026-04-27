# Sources and References

This document explains the historical and cultural references used in *The 1973 Draft* and clarifies how they enter the project.

## Direct Cultural Reference Points

- Bob Dylan, *Knockin' on Heaven's Door* (1973)
- *Pat Garrett & Billy the Kid* (Sam Peckinpah, 1973)
- Vietnam War / U.S. draft-era atmosphere
- 1973 anti-war and post-draft bureaucratic language
- The signing of the Paris Peace Accords in January 1973

## How These References Are Used

The project does **not** present its archive corpus as a literal historical document collection. Instead, it uses a hybrid corpus for retrieval:

1. `Synthetic archival reconstructions`
   - Original text fragments written for this artwork in a 1973-informed voice
   - Examples: fictional letters, draft-office fragments, domestic wartime reflections

2. `Interpretive cultural commentary`
   - Short commentary passages about the emotional world of Dylan, the anti-war period, and the idea of farewell

3. `Historical reference notes`
   - Brief references to recognizable historical moments or works, such as the Paris Peace Accords or *Pat Garrett & Billy the Kid*

4. `Short direct lyrical reference`
   - A limited Dylan quotation appears in the seed corpus as an explicit Dylan-related entry

## Academic Integrity Note

- The code, interaction design, orchestration logic, prompts, UI framing, and system architecture are original project work.
- The archive corpus is partly synthetic by design and should be understood as a creative reconstruction layer, not a scholarly source edition.
- Historical references are included to ground the project's atmosphere, symbolism, and thematic structure in the era surrounding the song.

## Where This Appears In Code

- Archive corpus: [backend/app/data/seed_documents.py](../backend/app/data/seed_documents.py)
- Retrieval logic: [backend/app/services/rag.py](../backend/app/services/rag.py)
