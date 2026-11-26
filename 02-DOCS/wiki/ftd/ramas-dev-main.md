# Ramas dev y main

**Intención:** subir el trabajo a GitHub constantemente sin publicar versiones a medias para los jugadores.

**Alcance:** reglas 1, 2 y 6 de `CLAUDE.md`; nueva rama `dev`; primer commit con el harness rsc; protección de `main`.

**Estado:** hecho (26 nov 2026). Spec: [ramas-dev-main](../sdd/specs/ramas-dev-main.md).

## Checklist
- [x] Reglas actualizadas en `CLAUDE.md` (dev libre, main solo con aprobación, editor permitido en GitHub).
- [x] Rama `dev` creada con el harness rsc y la configuración (commit `87c90f7`).
- [x] Spec aprobada por Daniel y panel de 3 revisores registrado (`e83d11f`).
- [x] `dev` subida a `origin`.
- [x] Push a `main`, `git push` sin rama, `--all`, `--mirror` y `gh pr merge` piden confirmación (`.claude/settings.json`, commit `8ebd646`).

## Evidencias
- `git ls-remote origin`: `refs/heads/dev` = `8ebd646`, `refs/heads/main` = `3a15e29` (sin cambios).
- Revisores de corrección, seguridad y pruebas: aprobado, sin bloqueantes. Grep de secretos en `01-TOOLS/` sin coincidencias, con control positivo.
- No verificado aún: que las reglas `ask` frenen de verdad un push a `main`. Se activan al reiniciar la sesión de Claude Code.

## Siguiente paso
- Decidir cómo probar `dev` en el móvil: servidor local en la wifi o una segunda web de Pages.
- Completar la constitución del proyecto (`02-DOCS/wiki/sdd/constitution.md`, ahora en borrador).
