# Punch combo finishers

Every fighter can chain three landed lights (LLL), or two landed lights into a heavy (LLH). Blocking, whiffing, taking a hit, or letting the input window expire breaks the chain. The follow-up input window now includes the current attack's recovery, so slow punches accept queued follow-ups. Finisher eligibility is latched when the third punch starts.

- Light / Ryuk LLL: animated uppercut launches upward with 32 ticks of hitstun.
- Inosuke LLL: short backward hop followed by a piercing dash. The extra hit deals 12 base damage, can be blocked or dodged, and cancels if Inosuke is interrupted. It does not spend First Fang's cooldown.
- David LLL: automatic 90-tick (1.5-second) Sandevistan burst and half-speed opponent movement/combat for the same duration, including while manual Sandevistan is cooling down. It does not reset the manual cooldown.
- Thragg LLH: 66-tick (1.1-second) stun with low pushback. Heavy base damage is 36 (previously 27), startup 28 ticks (previously 20), hitbox 84×62 (previously 66×44). Light hitbox is 60×46 (previously 48×36).
- Other fighters retain their existing third-light and heavy-finisher effects. Sukuna also uses three lights inside his domain.

The character guide lists the combos. Desktop and mobile use the existing light/heavy buttons. New animation and combat state travel in multiplayer snapshots; joiner dash damage is sent once and slow effects remain host-authoritative.

Automated coverage exercises every character's queued LLL and LLH, the four requested finishers, real recovery timing, whiffs/blocks/dodges, interruption, reset, animation rendering, and online ownership/state synchronization.
