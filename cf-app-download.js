(function () {
  'use strict';
  const opener = document.getElementById('cf-apk-open');
  const dialog = document.getElementById('cf-apk-dialog');
  const no = document.getElementById('cf-apk-no');
  const yes = document.getElementById('cf-apk-yes');
  const error = document.getElementById('cf-apk-error');
  opener.addEventListener('click', function () { error.textContent = ''; dialog.showModal(); });
  no.addEventListener('click', function () { dialog.close(); });
  yes.addEventListener('click', async function () {
    yes.disabled = true; error.textContent = '';
    try {
      const parts = await Promise.all([1,2,3,4].map(async function (n) {
        const response = await fetch('cf-apk-part-' + n + '.txt');
        if (!response.ok) throw new Error('Falha no download');
        return response.text();
      }));
      const decoded = atob(parts.join(''));
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], {type:'application/vnd.android.package-archive'}));
      const link = document.createElement('a');
      link.href = url; link.download = 'Convite-Facil.apk';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      dialog.close();
    } catch (_) { error.textContent = 'Não foi possível baixar. Verifique sua internet e tente novamente.'; }
    finally { yes.disabled = false; }
  });
})();
