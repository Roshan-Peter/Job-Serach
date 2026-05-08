
export default class HomeController {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  index() {
    return this.res.render('index', { title: 'Home' });
  }
  
}
