const notificationFilter = {
    error: false,
    urgent: false,
    warning: false,
    frequentWarning: false,
    action: false,
    frequent: true,
    tooFrequent: true,
    generic: false,
}

const notifications = [];

class Notification {
  constructor(content = "This is a notification.", life = 3, type = "generic") {
    this.content = content;
    this.life = life; // assuming life is a number representing seconds
    this.type = type;

    this.alive = true;

    if (notificationFilter[this.type]) {
        return;
      }

    const index = notifications.indexOf(undefined);
    if (index !== -1) {
      notifications[index] = this;
      this.index = index;
    } else {
      notifications.push(this);
      this.index = notifications.length - 1;
    }

    // For debugging and an idea of the styles
    switch(this.type) {
      case "error":
        console.log(`%c${this.content}`, 'color: #FF0000;');
        break;
      case "urgent":
        console.log(`%c${this.content}`, 'color: #FF0000; font-weight: bold;');
        break;
      case "warning":
        console.log(`%c${this.content}`, 'color: #FFFF00;');
        break;
      case "frequentWarning":
        console.log(`%c${this.content}`, 'color: #FFFF0077;');
        break;
      case "action":
        console.log(`%c${this.content}`, 'color: #11CC15;');
        break;
      case "frequent":
        console.log(`%c${this.content}`, 'color: #FFFFFFAA;');
        break;
      case "tooFrequent":
        console.log(`%c${this.content}`, 'color: #FFFFFF55;');
        break;
      case "generic":
      default:
        console.log(`%c${this.content}`, 'color: #ffffff;');
        break;
    }

    setTimeout(() => {
      this.alive = false;
      notifications[this.index] = undefined;
    }, this.life * 1000);
  }
}
