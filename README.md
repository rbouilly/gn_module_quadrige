# Module GeoNature Quadrige

## Présentation

Le module **Quadrige** permet d'interfacer GeoNature avec l'API GraphQL
d'Ifremer afin d'extraire : - la liste des programmes, - les données
associées, - et les fichiers ZIP générés par Quadrige Core.

Le module propose un backend Python/Flask intégré à GeoNature et un
frontend Angular.

------------------------------------------------------------------------


# TO_DO.md — Préparation complète avant déploiement du module Quadrige

## 🟦 1. Accès au bastion via Apache Guacamole

machine intermédiaire permettant d’établir une connexion sécurisée vers les serveurs internes, dont celui hébergeant GeoNature.

### Étapes :
1. Ouvrir le navigateur.
2. Désactiver le proxy :
   - Paramètres réseau → Proxy → **Pas de proxy**
3. Accéder à :
   https://165.169.200.105/guacamole/
4. Se connecter :
   - **Login** : `rbouilly`
   - **Mot de passe** : ...

Résultat attendu :  
Connexion a apahe Guacamole

---

## 🟦 2. Comprendre les flux d’accès

- **Guacamole** = Interface graphique qui donne accès **à une VM Windows**,
- Depuis cette machine Windows, on doit **se connecter en SSH** au serveur GeoNature.

il faut les informations suivantes:
- IP du serveur GeoNature  
- Identifiants SSH  
- Port SSH éventuel  
- Confirmation du chemin d’installation (souvent : `/home/geonatureadmin/geonature2`)

---

## 🟦 3. Connexion SSH depuis la VM Windows

Dans la session PowerShell Guacamole :

```powershell
ssh geonatureadmin@IP_DU_SERVEUR
```

Résultat attendu :

```
geonatureadmin@geonature:~$
```

---

## 🟦 4. Vérifications du serveur GeoNature

### 4.1 Vérifier les services
```bash
sudo systemctl status geonature
sudo systemctl status geonature-web
sudo systemctl status geonature-workers
```

### 4.2 Vérifier l’arborescence attendue
```bash
ls /home/
ls /home/geonatureadmin/
ls /home/geonatureadmin/geonature2/
ls /home/geonatureadmin/geonature2/venv/
```

### 4.3 Vérifier Python / pip
```bash
python3 --version
pip --version
```

---

## 🟦 5. Vérifications du module Quadrige AVANT installation

### 5.1 Vérifier la structure du projet

```
gn_module_quadrige/
  backend/
    gn_module_quadrige/
      __init__.py
      routes.py
      blueprint.py
      config_schema_toml.py
      extraction_data.py
      extraction_programs.py
      utils_backend.py
      migrations/
  VERSION
  README.rst
  setup.py
  requirements_backend.txt
```

✔ Structure compatible avec GeoNature  
✔ `MODULE_CODE = "quadrige"`  
✔ Entrypoints définis dans `setup.py`

### 5.2 Vérifier que le TOML existe

Dans :
```
gn_module_quadrige/module_code_config.toml
```

Contenu attendu :

```toml
[quadrige]
graphql_url = "https://quadrige-core.ifremer.fr/graphql/public"
access_token = "TOKEN_PRODUCTION"
```

Voir pour déployer avec un token DEAL, Demander à Rémi si c'est nécéssaire

---

## 🟦 6. Installer le module Quadrige sur le serveur GeoNature

### 6.1 Copier le module dans le serveur
Sur le serveur :

```bash
cd /home/geonatureadmin/modules
git clone https://github.com/basileandre056/gn_module_quadrige.git
cd gn_module_quadrige
```

### 6.2 Installer dans l’environnement Python de GeoNature
```bash
source /home/geonatureadmin/geonature2/venv/bin/activate
pip install .
```

### 6.3 Ajouter le module au fichier de configuration GeoNature
Éditer :
```
/home/geonatureadmin/geonature2/config/geonature_config.toml
```

Ajouter dans `[modules]` :
NE PAS remplacer la liste, mais ajouter "quadrige" dedans.

```toml
enabled = ["quadrige"]
```

### 6.4 Créer la configuration TOML du module
Créer le fichier :

```
/home/geonatureadmin/geonature2/config/gn_module_quadrige.toml
```

Contenu :

```toml
[quadrige]
graphql_url = "https://quadrige-core.ifremer.fr/graphql/public"
access_token = "TOKEN_DE_PRODUCTION"
```

---

## 🟦 7. Redémarrer GeoNature

```bash
sudo systemctl restart geonature
sudo systemctl restart geonature-web
sudo systemctl restart geonature-workers
```

Vérifier :

```bash
sudo journalctl -u geonature -f
```

---

## 🟦 8. Vérification du chargement du module

Test simple :

```bash
curl http://localhost:8000/quadrige/last-programmes
```

Résultat attendu :  
Une réponse JSON (pas une erreur Flask ou Apache).

---

## 🟦 9. Tests des extractions Quadrige

### 9.1 Extraction d’un programme

```bash
curl -X POST http://127.0.0.1:5001/quadrige/data-extractions \
  -H "Content-Type: application/json" \
  -d '{
        "programmes": [
          "ORC_MAYOTTE_BELT_POISSONS"
        ],
        "filter": {
          "name": "test_deploy",
          "fields": ["MONITORING_LOCATION_NAME"]
        }
      }'

```

### 9.2 Extraction de plusieurs programmes

```bash
curl -X POST http://127.0.0.1:5001/quadrige/data-extractions \
  -H "Content-Type: application/json" \
  -d '{
        "programmes": [
          "ORC_MAYOTTE_BELT_POISSONS",
          "ORC_MAYOTTE_LIT_BENTHOS",
          "EI_MAYOTTE_BLANCHISSEMENT_PCS_BENTHOS"
        ],
        "filter": {
          "name": "test_multiple",
          "fields": ["MONITORING_LOCATION_NAME"]
        }
      }'
```

Résultat attendu :
- Plusieurs ZIP générés  
- Si 1 programme échoue → les autres continuent  
- Aucun crash  

---

## 🟦 10. Checklist à valider jeudi

| Tâche | Statut |
|------|--------|
| Accès Guacamole OK | ✅ |
| Accès SSH au serveur GeoNature OK | ⬜ |
| GeoNature installé et accessible | ⬜ |
| Module Quadrige installé (pip install) | ⬜ |
| TOML module créé | ⬜ |
| Module activé dans geonature_config | ⬜ |
| Services redémarrés | ⬜ |
| API du module accessible | ⬜ |
| Extraction simple OK | ⬜ |
| Extraction multiple OK | ⬜ |

---

Fin du document.

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
