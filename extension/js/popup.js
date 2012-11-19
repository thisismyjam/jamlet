Jamlet = chrome.extension.getBackgroundPage().Jamlet;

Popup = {
  status: 'initial',

  init: function() {
    this.element = document.getElementById('popup');
    this.fetchHomeFeed();
  },

  fetchHomeFeed: function() {
    this.setStatus('fetchingHomeFeed');

    Jamlet.fetchHomeFeed(function(error, response) {
      if (this.status !== 'fetchingHomeFeed') return; // we've moved on

      if (error) {
        if (error.status === 401) {
          this.setStatus('unauthenticated');
        } else {
          this.lastError = error;
          this.setStatus('error');
        }
      } else {
        this.homeFeed = response;
        this.setStatus('homeFeed');
      }
    }.bind(this));
  },

  setStatus: function(status) {
    this.status = status;
    this.onChangeStatus();
  },

  onChangeStatus: function() {
    switch (this.status) {
      case 'fetchingHomeFeed':
        this.renderSpinner();
        break;
      case 'homeFeed':
        this.renderHomeFeed();
        break;
      case 'unauthenticated':
        this.renderSignInLink();
        break;
      case 'error':
        this.renderError();
        break;
    }
  },

  renderSpinner: function() {
    var spinnerElement = document.createElement('div');
    spinnerElement.className = 'spinner-container';
    this.element.appendChild(spinnerElement);

    var spinner = new Spinner();
    spinner.spin(spinnerElement);
  },

  renderHomeFeed: function() {
    this.element.innerHTML = 'There are ' + this.homeFeed.jams.length + ' jams in your home feed.';
  },

  renderSignInLink: function() {
    $(this.element)
      .html('You need to <a href="#">sign in</a>.')
      .find('a').click(function() {
        chrome.tabs.create({url: Jamlet.baseWebURL});
      });
  },

  renderError: function() {
    $(this.element).text('Tragically, there was an HTTP ' + this.lastError.status + ' error. Sorry.');
  }
};

Popup.init();
