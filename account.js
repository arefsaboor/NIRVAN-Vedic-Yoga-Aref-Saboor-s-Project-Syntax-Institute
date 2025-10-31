(function(){
  /** Get users object from storage. */
  function getUsers(){ try { return JSON.parse(localStorage.getItem('nirvan.users')||'{}'); } catch { return {}; } }
  /** Persist users object to storage. */
  function setUsers(obj){ localStorage.setItem('nirvan.users', JSON.stringify(obj)); }
  /** Get passwords map from storage. */
  function getPasswords(){ try { return JSON.parse(localStorage.getItem('nirvan.passwords')||'{}'); } catch { return {}; } }
  /** Persist passwords map to storage. */
  function setPasswords(obj){ localStorage.setItem('nirvan.passwords', JSON.stringify(obj)); }
  /** Current logged in email (or empty). */
  function currentEmail(){ return localStorage.getItem('nirvan.currentUser') || ''; }

  /**
   * Render a small transient toast in the top-right corner.
   * @param {string} msg
   * @param {'success'|'error'|'info'} [type]
   */
  function showToast(msg, type){
    const el = document.createElement('div');
    el.className = 'notification ' + (type||'info');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 14px;border-radius:8px;color:#fff;font-weight:500;font-size:14px;z-index:20000;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:all .3s ease;';
    if(type==='success') el.style.backgroundColor = 'var(--primary-green-500)';
    else if(type==='error') el.style.backgroundColor = '#e74c3c';
    else el.style.backgroundColor = 'var(--primary-dark-blue-500)';
    document.body.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateX(100%)'; setTimeout(()=>el.remove(),300); }, 3000);
  }

  document.addEventListener('DOMContentLoaded', function(){
    const email = currentEmail();
    if(!email){ window.location.href = 'index.html'; return; }

    const users = getUsers();
    const passwords = getPasswords();
    const profile = users[email] || { email };

    // Header
    const avatarImg = document.getElementById('acc-avatar');
    const nameH2 = document.getElementById('acc-name');
    const emailP = document.getElementById('acc-email');

    if(profile.avatar) avatarImg.src = profile.avatar; else avatarImg.src = 'Resources/Logo For Header Menu.png';
    nameH2.textContent = profile.displayName || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your Name';
    emailP.textContent = email;

    // Profile form
    const fFirst = document.getElementById('firstName');
    const fLast = document.getElementById('lastName');
    const fDisplay = document.getElementById('displayName');
    const fAvatar = document.getElementById('avatarFile');

    fFirst.value = profile.firstName || '';
    fLast.value = profile.lastName || '';
    fDisplay.value = profile.displayName || '';

    document.getElementById('saveProfile').addEventListener('click', async function(){
      profile.firstName = fFirst.value.trim();
      profile.lastName = fLast.value.trim();
      profile.displayName = fDisplay.value.trim() || [profile.firstName, profile.lastName].filter(Boolean).join(' ');
      profile.updatedAt = new Date().toISOString();
      users[email] = profile; setUsers(users);
      nameH2.textContent = profile.displayName || 'Your Name';
      showToast('Profile updated', 'success');
    });

    fAvatar.addEventListener('change', function(){
      const file = this.files && this.files[0];
      if(!file) return;
      if(file.size > 300*1024){ showToast('Please upload an image under 300KB', 'error'); return; }
      const reader = new FileReader();
      reader.onload = function(e){
        profile.avatar = e.target.result;
        profile.updatedAt = new Date().toISOString();
        users[email] = profile; setUsers(users);
        avatarImg.src = profile.avatar;
        showToast('Profile picture updated', 'success');
      };
      reader.readAsDataURL(file);
    });

    // Security form
    const cur = document.getElementById('curPassword');
    const npw = document.getElementById('newPassword');
    const cnpw = document.getElementById('confirmPassword');
    document.getElementById('savePassword').addEventListener('click', function(){
      const current = cur.value; const n = npw.value; const c = cnpw.value;
      if(!n || !c){ showToast('Please fill in new password and confirm', 'error'); return; }
      if(n.length < 8){ showToast('Password must be at least 8 characters', 'error'); return; }
      if(n !== c){ showToast('Passwords do not match', 'error'); return; }
      const existing = passwords[email];
      if(existing && current !== existing){ showToast('Current password is incorrect', 'error'); return; }
      passwords[email] = n; setPasswords(passwords);
      cur.value = npw.value = cnpw.value = '';
      showToast('Password updated', 'success');
    });

    // Sign out
    document.getElementById('signOut').addEventListener('click', function(){
      localStorage.removeItem('nirvan.currentUser');
      showToast('Signed out', 'success');
      setTimeout(()=>{ window.location.href = 'index.html'; }, 350);
    });
  });
})();
