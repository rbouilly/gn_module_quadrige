# Frontend du module externe GeoNature : Quadrige

Ce dossier contient le frontend Angular du module externe **Quadrige** destiné à être intégré dans GeoNature.

## Structure

## Développement local

Bien que ce module soit destiné à être chargé dans GeoNature, il peut être compilé ou testé localement via Angular CLI :

```bash
cd frontend
npm install
npm run build

Intégration dans GeoNature

Le dossier frontend est traité par le script d'installation de GeoNature.

Un lien symbolique sera créé vers assets/.

Le fichier gnModule.module.ts doit impérativement s'appeler ainsi pour être détecté.

Le backend expose le module via les entrypoints Python.

Dépendances

Le module réutilise les libraries de GeoNature via :


import { GN2CommonModule } from '@geonature_common/GN2Common.module';



Les assets doivent être appelés ainsi :

<img src="assets/quadrige/picto.png">



Notes

Aucun serveur Angular local n'est requis pour l'intégration dans GeoNature.

Les fichiers présents dans ce frontend sont minimaux mais suffisants pour la compilation.



---

# 🎯 Résultat final

Avec tout ce que nous avons généré (les fichiers précédents + ceux générés hier), ton dossier doit ressembler à :




frontend/
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── package.json
├── README.md
├── app/
│ ├── gnModule.module.ts
│ ├── index.html
│ ├── main.ts
│ ├── polyfills.ts
│ ├── styles.scss
│ ├── app-routing.module.ts
│ ├── test.ts
│ ├── environments/
│ │ ├── environment.ts
│ │ └── environment.prod.ts
│ ├── extracted-links/
│ ├── frontend-filter/
│ ├── program-extraction-filter/
│ └── programme-list/
└── assets/
└── quadrige/picto.png


