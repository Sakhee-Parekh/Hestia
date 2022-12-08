// var structure = { post: 'something', comments: [] }
// if (localStorage.getItem('structure')) {
//   structure = JSON.parse(localStorage.getItem('structure'))
// }
// function showAll (id) {
//   let element = document
//     .getElementById(id)
//     .getElementsByClassName('commentList')[0]
//     .getElementsByClassName('comments')
//   console.log(element)
//   for (let i = 5; i < element.length; i++) {
//     element[i].classList.remove('hidden')
//   }
// }

// function giveId () {
//   let id = parseInt(Math.random() * 10000)
//   let val = document.getElementById(id)
//   if (val === null) {
//     return id
//   } else {
//     giveId()
//   }
// }

// function addComment (id) {
//   let hidden = false
//   let root = document.getElementById(id)
//   let input = root.getElementsByTagName('input')[0].value.trim()

//   if (input.length !== 0) {
//     let commentList = root.getElementsByClassName('commentList')
//     if (commentList.length > 5) {
//       hidden = true
//     }
//     commentList[0].appendChild(createCommentBox(input, hidden))
//     if (commentList.length === 5) {
//       let showButton = createComponents('button', {
//         onclick: `showAll(${id})`
//       })
//       let commentNode = document.createTextNode('Show All')
//       showButton.appendChild(commentNode)
//       root.appendChild(showButton)
//     }
//   }
// }

// function createCommentBox (text, hidden) {
//   let id = giveId()
//   let root = createComponents('div', {
//     class: hidden ? 'comments hidden' : 'comments',
//     id: id
//   })
//   let add = createComponents('div', { class: 'add' })
//   let input = createComponents('input', { type: 'text' })
//   let button = createComponents('button', { onclick: `addComment(${id})` })
//   let list = createComponents('div', { class: 'commentList' })
//   let commentNode = document.createTextNode('comment')
//   button.appendChild(commentNode)
//   let textNode = document.createTextNode(text)
//   add.appendChild(input)
//   add.appendChild(button)
//   root.appendChild(textNode)
//   root.appendChild(add)
//   root.appendChild(list)

//   return root
// }

// function createComponents (value, attr) {
//   let element = document.createElement(value)
//   Object.keys(attr).forEach(at => {
//     element.setAttribute(at, attr[at])
//   })
//   return element
// }
