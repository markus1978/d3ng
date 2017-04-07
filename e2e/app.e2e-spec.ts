import { D3pPage } from './app.po';

describe('d3p App', () => {
  let page: D3pPage;

  beforeEach(() => {
    page = new D3pPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
