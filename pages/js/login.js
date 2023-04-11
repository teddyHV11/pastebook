if (document.cookie.indexOf("id=") !== -1) {
  window.location.href = "/panel";
}

function logIn() {
  const idInput = document.getElementById('id');
  const id = idInput.value;

  fetch(`/v1/check-if-exists?id=${id}`)
    .then(response => {
      if (response.status === 404) {
        const errorLabel = document.createElement('label');
        errorLabel.style.color = 'red';
        errorLabel.textContent = 'Account not found.';
        document.body.appendChild(errorLabel);
      } else {
        document.cookie = `id=${id}`;
        window.location.href = '/panel';
      }
    })
    .catch(error => console.error(error));
}

function register() {
  fetch('/v1/new-pastebook')
    .then(response => response.json())
    .then(data => {
      const pastebookId = data.id;
      document.cookie = `pastebookId=${pastebookId}; path=/`;
      window.location.href = '/panel';
    })
    .catch(error => console.error(error));
}
