const cardContainer = document.querySelector('.places-list');
const openCardsPop = document.querySelector('.user-info__button');
const openEditPop = document.querySelector('.user-info__edit');
const openAvatarImg = document.querySelector('.user-info__photo');

const popupContainer = document.querySelector('.popups');
const popupCards = document.querySelector('.popup__cards');
const popupEdit = document.querySelector('.popup__useredit');
const popupImageContainer = document.querySelector('.popup__image');
const avatarEdit = document.querySelector('.popup__edit-avatar');

const popupImage = popupImageContainer.querySelector('.popup__big-image');
const addButton = popupCards.querySelector('.popup__button_add');
const editButton = popupEdit.querySelector('.popup__button_edit');
const editAvatarButton = avatarEdit.querySelector('.popup__button_avatar');

const userName = document.querySelector('.user-info__name'); // Можно лучше - const - селектор не перезаписывается
const userJob = document.querySelector('.user-info__job'); // Можно лучше - const

const form = document.forms.new;
const name = form.elements.name;
const link = form.elements.link;

const editForm = document.forms.edit;
const username = editForm.elements.username;
const job = editForm.elements.userjob;

const avatarForm = document.forms.avatar;
const avatarurl = avatarForm.elements.useravatar;

const errorName = document.querySelector('.popup__error_name');
const errorUser = document.querySelector('.popup__error_username');
const errorJob = document.querySelector('.popup__error_userjob');
const errorUrl = document.querySelector('.popup__error_url');
const errorAvatar = document.querySelector('.popup__error_avatar');

class Api {
  constructor({ baseUrl, headers }) {
    this.url = baseUrl;
    this.headers = headers;
  }
  getInitialCards() {
    return fetch(`${this.url}/cards`, {
      headers: this.headers
    }).then(res => {
      if (res.ok) {
        return Promise.resolve(res.json());
      } else {
        return Promise.reject(res.status);
      }
    });
  }

  getUserName() {
    return fetch(`${this.url}/users/me`, {
      headers: this.headers
    }).then(res => {
      if (res.ok) {
        return Promise.resolve(res.json());
      } else {
        console.log('Кажется сайт не отвечает или неправильный урл');
      }
    });
  }

  setUserName(username, about) {
    return fetch(`${this.url}/users/me`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
        name: username,
        about // Проверка #3 можно улучшить: когда ключи совпадают
        // можно не дублировать { name: username, about}
        // для удобства проще передавать name тогда запись будет { name, about }
      })
    });
  }

  addImage(imgName, imgUrl) {
    return fetch(`${this.url}/cards`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name: imgName,
        link: imgUrl
      })
    });
  }

  deleteCard(cardId) {
    return fetch(`${this.url}/cards/${cardId}`, {
      method: 'DELETE',
      headers: this.headers
    }).then(res => {
      if (res.ok) {
        return Promise.resolve(res.json());
      } else {
        console.log('Кажется что-то пошло не так');
      }
    });
  }

  likeCard(cardId) {
    return fetch(`${this.url}/cards/like/${cardId}`, {
      method: 'PUT',
      headers: this.headers
    }).then(res => {
      if (res.ok) {
        return Promise.resolve(res.json());
      } else {
        console.log('Кажется что-то пошло не так');
      }
    });
  }

  dislikeCard(cardId) {
    return fetch(`${this.url}/cards/like/${cardId}`, {
      method: 'DELETE',
      headers: this.headers
    }).then(res => {
      if (res.ok) {
        return Promise.resolve(res.json());
      } else {
        console.log('Кажется что-то пошло не так');
      }
    });
  }

  setAvatar(newAvatar) {
    return fetch(`${this.url}/users/me/avatar`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
        avatar: newAvatar
      })
    });
  }
}

class Card {
  constructor(name, url, likes, createrId, cardId) {
    this.nameValue = name;
    this.urlValue = url;
    this.likes = likes;
    this.createrId = createrId;
    this.cardId = cardId;
    this.isLiked = false;
    this.cardActions = this.cardActions.bind(this);
    this.cardLikers = this.cardLikers.bind(this);

    this.cardElement = this.create();
    this.addListeners();
  }

  addListeners() {
    this.cardElement.addEventListener('click', this.cardActions);
    this.cardElement.addEventListener('mouseover', this.cardLikers);
  }

  //заготовка под показ лайкнувших по наведению мышки
  cardLikers() {
    if (event.target.classList.contains('place-card__like-icon')) {
      console.log('навел мышку на лайк');

      for (let i = 0; i < this.likes.length; i++) {
        // console.log(this.likes[i].name);
      }
    }
  }

  /****************************************
   * дополнительное задание - лайк и снятие лайка
   ****************************************/
  cardActions() {
    if (event.target.classList.contains('place-card__like-icon')) {
      const likesVal = event.target.nextSibling;
      const likeHeart = event.target;

      if (!this.isLiked) {
        api
          .likeCard(this.cardId)
          .then(res => {
            likeHeart.classList.add('place-card__like-icon_liked');
            this.likes = res.likes;
            likesVal.textContent = res.likes.length;
            this.isLiked = true;
            console.log('лайкнул');
          })
          .catch(err => {
            likeHeart.classList.remove('place-card__like-icon_liked');
            this.isLiked = false;
            likesVal.textContent = res.likes.length;
            console.log(err);
          });
      } else {
        api
          .dislikeCard(this.cardId)
          .then(res => {
            this.likes = res.likes;
            likeHeart.classList.remove('place-card__like-icon_liked');
            likesVal.textContent = res.likes.length;
            this.isLiked = false;
            console.log('дизлайкнул');
          })
          .catch(err => {
            likeHeart.classList.add('place-card__like-icon_liked');
            this.isLiked = true;
            likesVal.textContent = res.likes.length;
            console.log(err);
          });
      }
    }

    if (event.target.classList.contains('place-card__delete-icon')) {
      const isDelete = confirm('Вы уверены что хотите удалить изображение?');

      if (isDelete) {
        api
          .deleteCard(this.cardId)
          .then(res => {
            console.log(res);
          })
          .then(event.target.closest('.place-card').remove())
          .catch(err => {
            console.log(err);
          });
      }
    }
  }

  create() {
    const newCard = document.createElement('div');
    newCard.classList.add('place-card');

    const cardBg = document.createElement('div');
    cardBg.classList.add('place-card__image');
    cardBg.style.backgroundImage = `url(${this.urlValue})`;

    const cardDelete = document.createElement('button');
    cardDelete.classList.add('place-card__delete-icon');

    const cardDescription = document.createElement('div');
    cardDescription.classList.add('place-card__description');

    const cardName = document.createElement('h3');
    cardName.classList.add('place-card__name');
    cardName.textContent = this.nameValue;

    const likeContainer = document.createElement('div');
    likeContainer.classList.add('likes');

    const cardLike = document.createElement('button');
    cardLike.classList.add('place-card__like-icon');

    const cardLikeVal = document.createElement('div');
    cardLikeVal.classList.add('place-card__like-value');
    cardLikeVal.textContent = this.likes.length;

    /****************************************
     * дополнительное задание - подсчет лайков, показ кнопки удаления, отметка лайкнутых карточек
     ****************************************/
    if (this.likes.length > 9) {
      cardLikeVal.style.marginLeft = '5px';
    }

    if (this.createrId === userId) {
      cardDelete.style.display = 'block';
    }

    if (this.likes.length > 0) {
      for (let i = 0; i < this.likes.length; i++) {
        if (this.likes[i]._id === userId) {
          cardLike.classList.toggle('place-card__like-icon_liked');
          this.isLiked = true;
        }
      }
    }

    newCard.appendChild(cardBg);
    cardBg.appendChild(cardDelete);
    newCard.appendChild(cardDescription);

    cardDescription.appendChild(cardName);
    cardDescription.appendChild(likeContainer);
    likeContainer.appendChild(cardLike);
    likeContainer.appendChild(cardLikeVal);

    return newCard;
  }
}

//сделано Проверка #3 - отлично, данные передаются оптимальным образом
class Cardlist {
  constructor(container, cards) {
    this.cards = cards;
    this.container = container;

    this.addListener();
    this.render();
  }

  addCard(event) {
    /* Можно лучше: - Проверка #3 - попробуйте в свободное время
     * Не очень хорошая практика, когда мы напрямую подтягиваем другие классы в методы текущего класса.
     * Устанавливается очень большое количество зависимостей между классами.
     *
     * Попробуйте передать callback-функцию внутрь addCard
     * Например, внутри конструктора создать поле this.onAddCard = null;
     *
     * В метод addCard передавать параметр fn - это и будет наша коллбэк функция:
     * this.onAddCard = fn;
     *
     * После чего проверить, что пришло нам в качестве параметра fn и вызвать этот коллбэк:
     * evt.preventDefault();
     * return typeof this.onAddCard === `function` && this.onAddCard();
     *
     * https://habr.com/ru/post/151716/
     * */
    event.preventDefault();

    api
      .addImage(name.value, link.value)
      .then(res => {
        addButton.innerText = 'Загрузка...';

        if (res.ok) {
          return res.json();
        } else {
          console.log('Произошла ошибка');
        }
      })
      .then(res => {
        /****************************************
         * вопрос про слушатель.
         * Я создаю new Card и в конструкторе Card у меня сразу вешается слушатель
         * this.cardElement.addEventListener('click', this.cardActions);
         * Но почему то новые карточки не лайкаются и не удаляются, приходится обновлять страницу.
         * При этом при рендере все в порядке, хотя вроде бы суть действия та же
         ****************************************/
        const cardElement = new Card(
          res.name,
          res.link,
          res.likes,
          res.owner._id,
          res._id
        );
        //убрать create подумать над проблемой
        cardContainer.appendChild(cardElement.create());

        popup.reset(form);
        const formname = event.target.parentNode.parentNode;
        popup.close(formname);
        // let allCards = document.querySelectorAll('.place-card');
        // let lastCard = allCards[allCards.length - 1];

        // lastCard.addEventListener('click', cardElement.cardActions);
        // lastCard.addEventListener('mouseover', cardElement.cardLikers);
        // [].forEach.call(allCards, function(el) {
        //   el.addEventListener('click', function(e) {
        //     cardElement.cardActions();
        //   });
        // });
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        addButton.innerText = '+';
      });

    addButton.setAttribute('disabled', true);
    // Проверка #3 - можно писать так addButton.disabled = true
    // по аналогии можно поступать и с другими атрибутами img.src и тд
  }

  render() {
    for (let i = 0; i < this.cards.length; i++) {
      const { cardElement } = new Card(
        this.cards[i].name,
        this.cards[i].link,
        this.cards[i].likes,
        this.cards[i].owner._id,
        this.cards[i]._id
      );

      /* Можно лучше:
       * Не очень хорошая практика, когда мы напрямую подтягиваем другие классы в методы текущего класса.
       * Устанавливается очень большое количество зависимостей между классами.
       *
       * Попробуйте передать callback-функцию внутрь render
       * */

      this.container.appendChild(cardElement);
    }
  }

  addListener() {
    popupCards.addEventListener('submit', this.addCard);
  }
}

class Popup {
  open(formname) {
    formname.classList.toggle('popup_is-opened');
  }
  close(formname) {
    formname.classList.toggle('popup_is-opened');
  }
  reset(formname) {
    formname.reset();
  }

  checkName(error, field) {
    if (field.value.length === 0) {
      error.textContent = 'Это обязательное поле';
      this.disableButton(addButton);
      return false;
    } else if (field.validity.tooShort) {
      error.textContent = 'Должно быть от 2 до 30 символов';
      this.disableButton(addButton);
      return false;
    } else {
      error.textContent = '';
      this.enableButton(addButton);
      return true;
    }
  }
  checkUrl(field, linkLength, isValid) {
    if (linkLength === 0) {
      field.textContent = 'Это обязательное поле';
      this.disableButton(addButton);
      return false;
    }
    if (!isValid) {
      field.textContent = 'Здесь должна быть ссылка';
      this.disableButton(addButton);
      return false;
    } else {
      field.textContent = '';
      return true;
    }
  }

  setImg() {
    let imgBg = event.target.style.backgroundImage;
    let imgUrl = imgBg.match(/\((.*?)\)/)[1].replace(/('|")/g, '');
    popupImage.src = imgUrl;
  }
  editUser(event) {
    event.preventDefault();
    const formname = event.target.parentNode.parentNode;
    api
      .setUserName(username.value, job.value)
      .then(res => {
        editButton.innerText = 'Загрузка...';

        if (res.ok) {
          userName.textContent = username.value;
          userJob.textContent = job.value;
          this.close(formname);
          return res.json();
        } else {
          console.log('Произошла ошибка');
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        editButton.innerText = 'Сохранить';
      });
    // Проверка #3 - можно лучше - closest не привязан к разметке
    //закрываю попап
  }

  /****************************************
   * дополнительное задание - изменение аватарки
   ****************************************/
  editAvatar(event) {
    event.preventDefault();
    api
      .setAvatar(avatarurl.value)
      .then(() => {
        const formname = event.target.parentNode.parentNode;
        openAvatarImg.style.backgroundImage = `url('${avatarurl.value}')`;
        this.close(formname);
      })
      .catch(err => console.log(err));
  }

  fillField(formname) {
    const userName = document.querySelector('.user-info__name').textContent;
    const userJob = document.querySelector('.user-info__job').textContent;
    formname.querySelector('.popup__input_type_username').value = userName;
    formname.querySelector('.popup__input_type_userjob').value = userJob;
  }
  disableButton(button) {
    button.setAttribute('disabled', true);
    button.style.backgroundColor = 'transparent';
    button.style.color = 'rgba(0, 0, 0, .2)';
    // Проверка #3 - rgba(#000, .2); так проще писать
  }
  enableButton(button) {
    button.removeAttribute('disabled');
    button.style.backgroundColor = '#000000';
    button.style.color = '#FFFFFF';
  }

  validateAddCardButton() {
    let linkLength = link.value.length;
    let isValid = link.validity.valid;
    let isActiveName = this.checkName(errorName, name);
    let isActiveUrl = this.checkUrl(errorUrl, linkLength, isValid);
    // Проверка #3 const - нет перезаписи

    if (!isActiveName || !isActiveUrl) {
      this.disableButton(editButton);
    } else {
      this.enableButton(editButton);
    }
  }

  validateEditUserButton() {
    let isActiveName = this.checkName(errorJob, job);
    let isActiveJob = this.checkName(errorUser, username);
    if (!isActiveName || !isActiveJob) {
      this.disableButton(editButton);
    } else {
      this.enableButton(editButton);
    }
  }

  validateEditAvatarButton() {
    let linkLength = avatarurl.value.length;
    let isValid = avatarurl.validity.valid;
    let isActiveUrl = this.checkUrl(errorAvatar, linkLength, isValid);

    if (!isActiveUrl) {
      this.disableButton(editAvatarButton);
    } else {
      this.enableButton(editAvatarButton);
    }
  }
}

class User {
  constructor(name, about, avatar) {
    this.name = name;
    this.about = about;
    this.avatar = avatar;
    this.setName();
    this.setAvatar();
  }
  setName() {
    userName.textContent = this.name;
    userJob.textContent = this.about;
  }
  setAvatar() {
    openAvatarImg.style.backgroundImage = `url('${this.avatar}')`;
  }
}

const api = new Api({
  baseUrl: 'http://95.216.175.5/cohort2',
  headers: {
    authorization: '9b5510e1-e0ed-4f9f-8a0a-8043e75d5894',
    'Content-Type': 'application/json'
  }
});

const popup = new Popup();

/****************************************
 * вопрос про return.
 * Я хотел перенести editAvatar и editUser в класс User, но тогда я не могу использовать или user или userID
 * Как вернуть два значения? если я обозначу let user - new User
 * я не смогу вернуть и user и userId
 * Мне кажется что нужна деструктуризация, но я не понимаю как ее тут применить.
 ****************************************/
api
  .getUserName()
  .then(res => {
    new User(res.name, res.about, res.avatar);
    return (userId = res._id);
  })
  .catch(err => {
    console.log(err);
  });

api
  .getInitialCards()
  .then(cards => {
    if (cards && cards.length > 0) {
      new Cardlist(cardContainer, cards);
    }
  })
  .catch(err => {
    console.log(err);
  });

openCardsPop.addEventListener('click', function() {
  popup.open(popupCards);
  popup.reset(form);
  popup.checkUrl(errorUrl);
  popup.checkName(errorName, name);
});
openEditPop.addEventListener('click', function() {
  popup.open(popupEdit);
  popup.fillField(editForm);
  popup.checkName(errorUser, username);
  popup.checkName(errorJob, job);
  popup.enableButton(editButton);
});
openAvatarImg.addEventListener('click', function() {
  popup.open(avatarEdit);
  popup.reset(avatarForm);
  popup.checkUrl(errorAvatar);
  popup.disableButton(editAvatarButton);
});

cardContainer.addEventListener('click', function(event) {
  if (event.target.classList.contains('place-card__image')) {
    popup.open(popupImageContainer);
    popup.setImg();
  }
});

popupContainer.addEventListener('click', function(event) {
  if (event.target.classList.contains('popup__close')) {
    const popupName = event.target.parentNode.parentNode;
    popup.close(popupName);
  }
});

popupEdit.addEventListener('submit', function() {
  popup.editUser(event);
});

avatarEdit.addEventListener('submit', function() {
  popup.editAvatar(event);
});

form.addEventListener('input', function() {
  popup.validateAddCardButton();
});

editForm.addEventListener('input', function() {
  popup.validateEditUserButton();
});

avatarForm.addEventListener('input', function() {
  popup.validateEditAvatarButton();
});

/**
 * Проверка #2 - Хорошо
 *
 * Работа выполняет функционал по получению и работе с данными.
 * Класс api не содержит лишней логики, обратите внимание комментарии.
 * Получаются лишние зависимости. Комментарии "Надо исправить" обязательны.
 */

// Проверка #3 отличная работа реализован весь функционал задания
// обратите внимание на форму добавления карточки стоит запускать
//  валидацию полей только после начала ввода данных

// подумайте о разделении кода на файлы модули это пригодится в следующих спринтах
// и сделает код более легким визуально
