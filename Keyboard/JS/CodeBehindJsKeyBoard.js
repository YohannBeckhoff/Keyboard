/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.14.3.431/runtimes/native1.12-tchmi/TcHmi.d.ts" />
(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    let destroyOnInitialized = TcHmi.EventProvider.register('onInitialized', (e, data) => {
        e.destroy();
        //Ce script fais un console log de toutes les touches pressée et 
        //provoque la fermeture du Keyboard quand on appuye sur Enter

        // Délégation d'événement : écoute sur document pour capturer
        // les touches du clavier TcHmi même créées dynamiquement
        document.addEventListener('pointerdown', function (event) {
            var key = event.target.closest('.tchmi-keyboard-template-key');
            if (!key) return;

            var code = key.dataset.code;
            var keyValue = key.dataset.key;
            var type = key.dataset.type || 'normal';

            console.log('Touche pressée =>', { code, keyValue, type });

            if (code === 'Enter' || code === 'NumpadEnter') {
                console.log('✅ ENTER détecté !');
                                // Fermeture de la popup en cliquant sur la croix
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