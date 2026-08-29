import type { UiLabels } from './types';

// Seven test files each carried their own copy of this object. Adding two keys
// to UiLabels broke all seven at once, in a way that had nothing to teach: the
// type was right, the fixtures were just duplicated. One fixture means the next
// key is a one-line change, and the sentinel suffix stays consistent so a label
// that leaks into the wrong control is still obvious in a failure message.
export const uiLabels: UiLabels = {
  menu: 'MENU_X',
  closeMenu: 'CLOSE_MENU_X',
  copy: 'COPY_X',
  copied: 'COPIED_X',
  expandBio: 'EXPAND_BIO_X',
  collapseBio: 'COLLAPSE_BIO_X',
  expandProject: 'EXPAND_PROJECT_X',
  collapseProject: 'COLLAPSE_PROJECT_X',
};
