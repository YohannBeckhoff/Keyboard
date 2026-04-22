
## 🏷️ Tags

#TcHmi #Beckhoff #TwinCAT #JavaScript #CodeBehind #Keyboard #Popup #HMI
## 📌 Contexte

Le clavier virtuel **TcHmiKeyboard** (Beckhoff TwinCAT HMI) s'affiche dans une `Popup` lorsqu'un champ de saisie est activé. Par défaut, seule la **croix** dans le header de la popup permet de la fermer. L'objectif de ce développement est de faire en sorte que la touche **Entrée** (clavier alphanumérique et pavé numérique) déclenche également la fermeture de la popup.

---

## 🧩 Problématique

- Le clavier TcHmi est un composant **créé dynamiquement** dans le DOM à chaque ouverture de la popup.
- Un `querySelectorAll` classique exécuté au `onInitialized` ne trouve pas les touches, car elles n'existent pas encore dans le DOM à ce moment.
- Il faut donc utiliser une **délégation d'événement** sur le `document` pour intercepter les clics, quelle que soit la date de création des éléments.

---

## ⚙️ Solution – CodeBehind JavaScript

Le script est placé dans le fichier `.js` du projet TcHmi (codeBehind), à l'intérieur de l'événement `onInitialized`.

```javascript
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.14.3.431/runtimes/native1.12-tchmi/TcHmi.d.ts" />
(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    let destroyOnInitialized = TcHmi.EventProvider.register('onInitialized', (e, data) => {
        e.destroy();
        // Ce script journalise toutes les touches pressées et
        // provoque la fermeture du clavier lorsque la touche Entrée est actionnée.
        // Délégation d'événement : écoute sur document pour capturer
        // les touches du clavier TcHmi même créées dynamiquement.
        document.addEventListener('pointerdown', function (event) {
            var key = event.target.closest('.tchmi-keyboard-template-key');
            if (!key) return;
            var code = key.dataset.code;
            var keyValue = key.dataset.key;
            var type = key.dataset.type || 'normal';
            console.log('Touche pressée =>', { code, keyValue, type });
            if (code === 'Enter' || code === 'NumpadEnter') {
                console.log('✅ ENTER détecté !');
                // Fermeture de la popup en simulant un clic sur la croix.
                var closeBtn = document.querySelector(
                    '.TcHmi_Controls_UiProvider_TcHmiKeyboard-popup .TcHmi_Controls_Helpers_Popup-header-container a'
                );
                if (closeBtn) {
                    closeBtn.click();
                    console.log('✅ Popup fermée !');
                } else {
                    console.warn('⚠️ Bouton de fermeture introuvable');
                }
            }
        });
    });
})(TcHmi);
```

---

## 🔍 Détail des fonctionnalités

### 1. Enregistrement sur `onInitialized`

```javascript
TcHmi.EventProvider.register('onInitialized', (e, data) => { e.destroy(); ... })
```

- Le script s'exécute **une seule fois** au démarrage du runtime TcHmi.
- `e.destroy()` libère l'écouteur immédiatement après l'exécution pour éviter les fuites mémoire.

---

### 2. Délégation d'événement sur le `document`

```javascript
document.addEventListener('pointerdown', function (event) { ... })
```

- Écoute **tous les clics** sur la page, y compris sur des éléments créés dynamiquement après le chargement.
- Utilise `pointerdown` plutôt que `click` pour une compatibilité optimale avec les interfaces **tactiles** (écrans industriels Beckhoff).

---

### 3. Ciblage de la touche pressée

```javascript
var key = event.target.closest('.tchmi-keyboard-template-key');
if (!key) return;
```

- `event.target` correspond à l'élément exactement cliqué (parfois un `<span>` ou un `<svg>` enfant).
- `.closest()` remonte dans le DOM pour trouver l'élément parent portant la classe `.tchmi-keyboard-template-key`.
- Si aucune touche clavier n'est trouvée, le script s'arrête immédiatement (`return`), sans traitement inutile.

---

### 4. Lecture des attributs `data-*` de la touche

```javascript
var code = key.dataset.code;      // ex: "Enter", "NumpadEnter", "KeyA"
var keyValue = key.dataset.key;   // ex: "Enter", "a", "1"
var type = key.dataset.type || 'normal'; // ex: "edit", "modifier", "normal"
```

- Chaque touche du clavier TcHmi expose ses informations via des attributs HTML `data-*`.
- `code` identifie la touche physique (indépendant de la langue/layout).
- `keyValue` est la valeur caractère produite.
- `type` indique la nature de la touche (`modifier` pour Shift, `edit` pour Backspace, etc.).

---

### 5. Logging console

```javascript
console.log('Touche pressée =>', { code, keyValue, type });
```

- Journalise **chaque touche pressée** dans la console du navigateur (F12).
- Utile pour le **debug** et la vérification du bon fonctionnement.

---

### 6. Détection de la touche Entrée

```javascript
if (code === 'Enter' || code === 'NumpadEnter') { ... }
```

- Gère les deux variantes de la touche Entrée :
    - `Enter` → clavier alphanumérique standard
    - `NumpadEnter` → pavé numérique (clavier numérique TcHmi)

---

### 7. Fermeture de la popup

```javascript
var closeBtn = document.querySelector(
    '.TcHmi_Controls_UiProvider_TcHmiKeyboard-popup .TcHmi_Controls_Helpers_Popup-header-container a'
);
if (closeBtn) {
    closeBtn.click();
}
```

- Cible précisément la **croix de fermeture** `<a>` dans le header de la popup du clavier TcHmi.
- Le sélecteur est volontairement précis (classe `.TcHmi_Controls_UiProvider_TcHmiKeyboard-popup`) pour ne pas impacter d'autres popups éventuellement ouvertes sur la page.
- Simule un clic sur la croix, ce qui déclenche le mécanisme natif de fermeture TcHmi.
- Un `console.warn` s'affiche si le bouton est introuvable, facilitant le diagnostic.

---

## 📁 Emplacement du fichier

Le script est à placer dans le fichier codeBehind JS de votre projet TcHmi, généralement :

```
/votre-projet/TcHmiProject.js
```

---
## 🗂️ Dépôt GIT 
Un projet complet et fonctionnel est disponible en téléchargement :
 🔗 [YohannBeckhoff/Keyboard](https://github.com/YohannBeckhoff/Keyboard) 
 Le dépôt contient : - Le projet TcHmi complet et fonctionnel - Le fichier codeBehind JS avec le script prêt à l'emploi - Un exemple d'intégration du clavier dans une page HMI ### Cloner le dépôt 
 
```bash 
 git clone https://github.com/YohannBeckhoff/Keyboard.git 
 ```
 
 
