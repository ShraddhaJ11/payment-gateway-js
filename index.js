(function () {
  var cardNumberField = document.querySelector('#card-number-field');
  var cardNumber = document.querySelector('#cardNumber');
  var CVV = document.querySelector("#cvv");
  var expiryDate = document.querySelector('#expiration-date');
  var confirmButton = document.querySelector('#confirm-purchase');
  var mastercard = document.querySelector("#mastercard");
  var visa = document.querySelector("#visa");
  var maestro = document.querySelector("#maestro");
  var list = document.querySelector('#list');

  // Support three card type and their regex
  var acceptedCreditCards = {
    'visa': /^4[0-9]{12}(?:[0-9]{3})?$/,
    'mastercard': /^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/,
    'maestro': /^(5[06-8]|6\d)\d{14}(\d{2,3})?$/
  }

  // function to create new list item with given card info
  const addCreditCard = function (cardInfo) {
    const listItem = document.createElement("li");
    const span = document.createElement("span");
    span.className = 'cross_button';
    span.innerText = '✕';
    span.dataset.cardNumber = cardInfo['Card Number'];
    listItem.dataset.cardNumber = cardInfo['Card Number'];
    for (let key in cardInfo) {
      const div = document.createElement("div"); //span
      div.innerText = key + ' : ' + cardInfo[key];
      listItem.appendChild(div)
    }
    listItem.appendChild(span);
    listItem.style.cssText = "margin: 10px;padding: 15px;background: white;font-size: 15px;line-height: 20px"
    return listItem;
  }

  // fetch the existing card from the local storage and creates the list 
  const cards = JSON.parse(localStorage.getItem("cards") || "[]");
  if (cards.length) {
    for (let i = 0; i < cards.length; i++) {
      list.appendChild(addCreditCard(cards[i]));
    }
  }

  // Return the number of digits in number
  function getCardNumberLength(number) {
    const numstring = number + "";
    return numstring.length;
  }

  // Return sum of even-place digits in number
  function sumOfDoubleEvenPlace(number) {
    let sum = 0;
    const num = number + "";
    for (let i = getCardNumberLength(number) - 2; i >= 0; i -= 2)
      sum += getDigit(parseInt(num.charAt(i) + "") * 2);
    return sum;
  }

  /**
   * Return this number if it is a single digit, otherwise,
   * return the sum of the two digits
   */
  function getDigit(number) {
    if (number < 9)
      return number;
    return Math.floor(number / 10) + number % 10;
  }

  // Return sum of odd-place digits in number
  function sumOfOddPlace(number) {
    let sum = 0;
    const num = number + "";
    for (let i = getCardNumberLength(number) - 1; i >= 0; i -= 2)
      sum += parseInt(num.charAt(i) + "");
    return sum;
  }

  /**
   * check credit card number length is valid or not
   * validate card number using Luhn algorithm
   * checks the type of credit card(mastercard, visa, maestro) using regex
   * return an object containing type of credit card and valid flag
   */
  function validateCardNumber(number) {
    // remove all non digit characters
    let num = number.replace(/\D/g, '');

    const valid = (getCardNumberLength(num) >= 12 &&
      getCardNumberLength(num) <= 19) &&
      ((sumOfDoubleEvenPlace(num) +
        sumOfOddPlace(num)) % 10 == 0);

    let accepted = false;
    let cardType = {};
    // loop through the keys (visa, mastercard, maestro)
    Object.keys(acceptedCreditCards).forEach(function (key) {
      var regex = acceptedCreditCards[key];
      if (regex.test(num)) {
        accepted = true;
        cardType['card'] = key;
      }
    });
    cardType['valid'] = valid && accepted;
    return cardType;
  }

  /**
   * @param creditCard 
   * @param cvv 
   * fetch the credit card type using vaildateCardNumber function
   * if card type is maestro it may not require CVV
   * for all other cards(mastercard & visa) CVV length should be 3
   */
  function validateCVV(creditCard, cvv) {
    // remove all non digit characters
    var creditCard = creditCard.replace(/\D/g, '');
    var cvv = cvv.replace(/\D/g, '');
    // maestro doesn'tuse cvv
    if (validateCardNumber(creditCard).valid && validateCardNumber(creditCard).card === 'maestro') {
      if ((/^\d{0}$/).test(cvv) || (/^\d{3}$/).test(cvv))
        return true;
    } else if ((/^\d{3}$/).test(cvv)) {
      return true;
    }
    return false;
  }

  // reset form fields after submission
  function resetForm() {
    cardNumber.value = '';
    CVV.value = '';
    cardNumberField.classList.remove('has-error', 'has-success');
    document.querySelector('.CVV').classList.remove('has-error', 'has-success');
    maestro.classList.remove('transparent');
    visa.classList.remove('transparent');
    mastercard.classList.remove('transparent');
  }

  // Allow user to enter only numeric character
  function allowNumbersOnly(e) {
    var code = (e.which) ? e.which : e.keyCode;
    if (code > 31 && (code < 48 || code > 57)) {
      e.preventDefault();
    }
  }

  cardNumber.addEventListener('keypress', function (e) {
    allowNumbersOnly(e);
  })

  // Adding space after every fourth number 
  cardNumber.addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
  });


  // Remove selected card from the list as well as local storage
  list.addEventListener('click', function (e) {
    let cards = JSON.parse(localStorage.getItem("cards") || "[]");
    cards = cards.filter(ele => ele['Card Number'] !== e.target.dataset.cardNumber);
    localStorage.setItem("cards", JSON.stringify(cards));
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
  })

  // restricts user for entering CVV if card number is empty 
  CVV.addEventListener('keypress', function (e) {
    if (!cardNumber.value) {
      cardNumberField.classList.add('has-error');
      alert('Enter the card number first');
      e.preventDefault();
      return false
    }
    else
      allowNumbersOnly(e);
  });

  // restricts user for entering date if card number is empty 
  expiryDate.addEventListener('change', function (e) {
    if (!cardNumber.value) {
      cardNumberField.classList.add('has-error');
      alert('Enter the card number first');
      e.preventDefault();
      return false
    }
  });

  // validating CVV number onblur event and adding the success or error class 
  CVV.addEventListener('blur', function () {
    if (validateCVV(cardNumber.value, CVV.value))
      document.querySelector('.CVV').classList.add('has-success');
    else
      document.querySelector('.CVV').classList.add('has-error');
    // Regex to mask CVV number
    CVV.value = CVV.value.replace(/\d/g, "*");
  })

  // validating card number onblur event and adding success or error class
  cardNumber.addEventListener('blur', function () {
    maestro.classList.remove('transparent');
    visa.classList.remove('transparent');
    mastercard.classList.remove('transparent');
    const cardType = validateCardNumber(cardNumber.value);
    if (!cardType.valid) {
      cardNumberField.classList.add('has-error');
    } else {
      cardNumberField.classList.remove('has-error');
      cardNumberField.classList.add('has-success');
    }
    if (cardType.card == 'visa') {
      mastercard.classList.add('transparent');
      maestro.classList.add('transparent');
    } else if (cardType.card == 'maestro') {
      mastercard.classList.add('transparent');
      visa.classList.add('transparent');
    } else if (cardType.card == 'mastercard') {
      maestro.classList.add('transparent');
      visa.classList.add('transparent');
    }
  });

  /**
   * Shows alert message if card number is invalid or CVV is invalid
   * Call addCreditCard function to create new item and append in to the existing list
   * Stores the cards in local storage so that after page refresh we can get saved cards
   */
  confirmButton.addEventListener('click', function (e) {
    e.preventDefault();
    const cards = JSON.parse(localStorage.getItem("cards") || "[]");
    const isCardValid = validateCardNumber(cardNumber.value);
    const isCvvValid = validateCVV(cardNumber.value, CVV.value);
    const date = expiryDate.children[1].value + '/' + '20' + expiryDate.children[2].value

    if (!cardNumberField.classList.contains("has-success")) {
      alert("Please enter a valid card number");
    }
    else if (!document.querySelector('.CVV').classList.contains('has-success')) {
      alert("Please enter a valid CVV");
    }
    else {
      const cardInfo = {
        'Card Number': cardNumber.value,
        'CVV': CVV.value,
        'Expiry Date': date
      }
      cards.push(cardInfo);
      // Create a new list item with to save new card
      var listItem = addCreditCard(cardInfo);
      // Append listItem in to list of added card
      list.appendChild(listItem);
      localStorage.setItem("cards", JSON.stringify(cards));
      // reset form
      resetForm();
    }
  });
})();
