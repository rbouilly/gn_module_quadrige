# Module GeoNature Quadrige

## Présentation

Le module **Quadrige** permet d'interfacer GeoNature avec l'API GraphQL
d'Ifremer afin d'extraire : - la liste des programmes, - les données
associées, - et les fichiers ZIP générés par Quadrige Core.

Le module propose un backend Python/Flask intégré à GeoNature et un
frontend Angular.

------------------------------------------------------------------------

## Installation du module

### 1. Copier le module dans `external_modules`

``` bash
cd /home/geonatureadmin/geonature/external_modules/
git clone https://votre-repo/gn_module_quadrige.git
```

### 2. Installer les dépendances Python

``` bash
source /home/geonatureadmin/geonature/backend/venv/bin/activate
pip install -r gn_module_quadrige/backend/gn_module_quadrige/requirements_backend.txt
```

------------------------------------------------------------------------

## Configuration

Éditer :

    gn_module_quadrige/module_code_config.toml

Et renseigner :

``` toml
[quadrige]
graphql_url = "https://quadrige-core.ifremer.fr/graphql/public"
access_token = "VOTRE_TOKEN_IFREMER"
```

------------------------------------------------------------------------

## Installation dans GeoNature

### Si le module n'a jamais été installé :

``` bash
cd /home/geonatureadmin/geonature/backend
geonature install-module gn_module_quadrige
```

### Si mise à jour ou migrations :

``` bash
geonature update-module gn_module_quadrige
```

------------------------------------------------------------------------

## Redémarrer GeoNature

``` bash
sudo systemctl restart geonature
sudo systemctl restart geonature-worker
```

------------------------------------------------------------------------

## Vérifications

### Tester que la configuration est chargée :

    https://votre-geonature/api/quadrige/debug_config

### Accéder au frontend :

    https://votre-geonature/quadrige

------------------------------------------------------------------------

## Contact & Support

Pour toute question technique ou demande d'amélioration, contactez le
mainteneur du module.
