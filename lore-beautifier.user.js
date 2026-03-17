// ==UserScript==
// @name         Lore Beautifier — Header
// @namespace    github.com/goodmartian/lore-beautifier
// @version      1.0.0
// @description  Rebuilds lore.kernel.org header into a proper flexbox layout
// @author       goodmartian
// @match        https://lore.kernel.org/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // Find the header <pre> via the search input (unique: name="q")
  const input = document.querySelector('input[name="q"]');
  if (!input) return;

  const headerPre = input.closest('pre');
  if (!headerPre) return;

  const form = headerPre.closest('form');

  // Single pass: collect archive link + nav links
  let archiveLink = null;
  const navLabelSet = new Set(['help', 'color', 'mirror', 'Atom feed']);
  const navLinks = [];

  for (const a of headerPre.querySelectorAll('a')) {
    const text = a.textContent.trim();
    if (!archiveLink && text.includes('archive mirror')) {
      archiveLink = a;
    } else if (navLabelSet.has(text)) {
      navLinks.push({ href: a.href, text });
    }
  }

  // --- Build header (DOM only, styles in .user.css) ---
  const header = document.createElement('header');
  header.id = 'lb-header';

  // Title
  const titleDiv = document.createElement('div');
  titleDiv.className = 'lb-title';
  const titleA = document.createElement('a');
  titleA.href = archiveLink ? archiveLink.href : './';
  titleA.textContent = archiveLink ? archiveLink.textContent.trim() : 'archive mirror';
  titleDiv.appendChild(titleA);
  header.appendChild(titleDiv);

  // Bar: search + nav
  const bar = document.createElement('div');
  bar.className = 'lb-bar';

  // Search form
  const searchForm = document.createElement('form');
  searchForm.action = form ? form.action : './';
  searchForm.method = form ? form.method : 'get';
  searchForm.className = 'lb-search';

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.name = 'q';
  newInput.value = input.value;
  newInput.placeholder = 'search\u2026';
  searchForm.appendChild(newInput);

  const newSubmit = document.createElement('input');
  newSubmit.type = 'submit';
  newSubmit.value = 'search';
  searchForm.appendChild(newSubmit);
  bar.appendChild(searchForm);

  // Nav
  const nav = document.createElement('nav');
  nav.className = 'lb-nav';
  navLinks.forEach((link, i) => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    nav.appendChild(a);
    if (i < navLinks.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.textContent = '/';
      nav.appendChild(sep);
    }
  });
  bar.appendChild(nav);
  header.appendChild(bar);

  // Insert and hide original
  const insertTarget = form || headerPre;
  insertTarget.parentNode.insertBefore(header, insertTarget);

  if (form) {
    form.style.display = 'none';
  } else {
    headerPre.style.display = 'none';
  }
})();
