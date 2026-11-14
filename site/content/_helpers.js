/* Content authoring helpers.
   A könyv fejezetei ezekkel a rövidítésekkel épülnek fel. */
(function () {
  const MB = (window.MB = window.MB || {});
  MB.sections = MB.sections || [];
  MB.formulas = MB.formulas || [];
  MB.videos = MB.videos || [];
  MB.examBank = MB.examBank || [];

  MB.section = function (s) { MB.sections.push(s); };
  MB.def = function (title, body) { return { t: 'def', title: title, body: body }; };
  MB.thm = function (title, body) { return { t: 'thm', title: title, body: body }; };
  MB.note = function (title, body) { return { t: 'note', title: title, body: body }; };
  MB.warn = function (title, body) { return { t: 'warn', title: title, body: body }; };
  MB.formula = function (title, latex, note) { return { t: 'formula', title: title, latex: latex, note: note }; };
  MB.p = function (body) { return { t: 'p', body: body }; };
  MB.list = function (title, items) { return { t: 'list', title: title, items: items }; };
  MB.example = function (o) { return o; };
  MB.q = function (o) { return Object.assign({ level: 1, type: 'expr' }, o); };
  MB.video = function (o) { return o; };
})();
