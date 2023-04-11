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

  });
});
}, 500);


