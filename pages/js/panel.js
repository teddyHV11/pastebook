if (document.cookie.indexOf("id=") === -1) {
  window.location.href = "/login";
}

const coppybtn = document.querySelectorAll('.copy-btn');

coppybtn.forEach((btn) => {
  btn.addEventListener('click', () => {
    const textToCopy = btn.closest('.container').querySelector('p').innerText;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // show ze notification
      })
      .catch((err) => {
        console.error('O CRAP ', err);
      });
  });
});



const id = document.cookie.replace(/(?:(?:^|.*;\s*)id\s*\=\s*([^;]*).*$)|^.*$/, "$1");


fetch(`/v1/get-pastes?id=${id}`)
  .then(response => response.json())
  .then(data => {
    const categories = Object.keys(data).filter(key => key !== "created");

    categories.forEach(category => {
      const button = document.createElement("button");
      button.classList.add("collapsible");
      button.textContent = category;
      button.dataset.category = "b";
      document.body.appendChild(button);

      const content = document.createElement("div");
      content.classList.add("content");
      document.body.appendChild(content);
    
      data[category].forEach(value => {
        const copyButton = document.createElement("button");
        copyButton.classList.add("copy");
        copyButton.textContent = value;
        content.appendChild(copyButton);
      });
    });
  })
  .catch(error => console.error(error));

setTimeout(function(){
    var coll = document.getElementsByClassName("collapsible");
        var i;

      for (i = 0; i < coll.length; i++) {
          coll[i].addEventListener("click", function() {
          this.classList.toggle("active");
          var content = this.nextElementSibling;
          if (content.style.maxHeight){
            content.style.maxHeight = null;
          } else {
           content.style.maxHeight = content.scrollHeight + "px";
        } 
       });
      }
const copyButtons = document.querySelectorAll('.copy');
copyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const textarea = document.createElement('textarea');
    textarea.value = button.textContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    button.style.backgroundColor = "green";
    setTimeout(function() {
      button.style.backgroundColor = "";
    }, 200);

  });
});
}, 500);


function addEntry() {
  var category = prompt("Category:");
  var entry = prompt("Entry:");
  if (category !== null && entry !== null) {
    var url = "/v1/add-entry?id=" + id + "&category=" + category + "&entry=" + entry;
    sendRequest(url);
    location.reload();
  }
}

function addCategory() {
  var name = prompt("Category name to add:");
  if (name !== null) {
    var url = "/v1/add-category?id=" + id + "&name=" + name;
    sendRequest(url);
    location.reload();
  }
}

function removeCategory() {
  var name = prompt("Category name to remove:");
  if (name !== null) {
    var url = "/v1/delete-category?id=" + id + "&category=" + name;
    sendRequest(url);
    location.reload();
  }
}

function removeEntry() {
  var category = prompt("Category name:");
  var entry = prompt("Entry name to remove:");
  if (category !== null && entry !== null) {
    var url = "/v1/delete-entry?id=" + id + "&category=" + category + "&entry=" + entry;
    sendRequest(url);
    location.reload();
  }
}


function sendRequest(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.send();
}

function logout() {
  document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/";
}

setTimeout(() => {
  const collapsibles = document.querySelectorAll(".collapsible, .collapsible.active");

  collapsibles.forEach(collapsible => {
    collapsible.addEventListener("contextmenu", e => {
      e.preventDefault();
      const category = collapsible.textContent.trim();
      const newEntry = prompt("Enter the new paste:");
      if (newEntry) {
        const url = `/v1/add-entry?id=${id}&category=${category}&entry=${encodeURIComponent(newEntry)}`;
        fetch(url)
          .then(response => {
            location.reload();
          })
      }
    });
  });
},500);
