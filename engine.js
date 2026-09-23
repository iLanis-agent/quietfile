/* QuietFile engine - pure disturbance-log stats, shared by app.html and node tests. */
(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuietFileEngine = factory();
})(typeof self !== 'undefined' ? self : this, function(){

  /* entry: { ts: ms epoch, type: string, minutes: number } */

  function localDateStr(ts, tzOffsetMin){
    var d = new Date(ts - tzOffsetMin * 60000);
    return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
  }
  function localHour(ts, tzOffsetMin){
    return new Date(ts - tzOffsetMin * 60000).getUTCHours();
  }

  /* nights = distinct local dates with at least one entry */
  function nightsAffected(entries, tzOffsetMin){
    var days = {};
    for (var i = 0; i < entries.length; i++) days[localDateStr(entries[i].ts, tzOffsetMin)] = true;
    return Object.keys(days).length;
  }

  function totalMinutes(entries){
    var s = 0;
    for (var i = 0; i < entries.length; i++) s += entries[i].minutes;
    return s;
  }

  function spanDays(entries, tzOffsetMin){
    if (!entries.length) return 0;
    var min = entries[0].ts, max = entries[0].ts;
    for (var i = 1; i < entries.length; i++){
      if (entries[i].ts < min) min = entries[i].ts;
      if (entries[i].ts > max) max = entries[i].ts;
    }
    /* calendar days from first to last local date, inclusive */
    var a = localDateStr(min, tzOffsetMin).split('-');
    var b = localDateStr(max, tzOffsetMin).split('-');
    var da = Date.UTC(+a[0], +a[1] - 1, +a[2]);
    var db = Date.UTC(+b[0], +b[1] - 1, +b[2]);
    return Math.round((db - da) / 86400000) + 1;
  }

  /* hour histogram 0-23 in local time */
  function hourHistogram(entries, tzOffsetMin){
    var h = new Array(24).fill(0);
    for (var i = 0; i < entries.length; i++) h[localHour(entries[i].ts, tzOffsetMin)]++;
    return h;
  }

  /* worst hours: up to 3 hours with most incidents */
  function worstHours(entries, tzOffsetMin){
    var h = hourHistogram(entries, tzOffsetMin);
    var pairs = [];
    for (var i = 0; i < 24; i++) if (h[i] > 0) pairs.push([h[i], i]);
    pairs.sort(function(a, b){ return b[0] - a[0] || a[1] - b[1]; });
    return pairs.slice(0, 3).map(function(p){ return { hour: p[1], count: p[0] }; });
  }

  function typeCounts(entries){
    var c = {};
    for (var i = 0; i < entries.length; i++){
      var t = entries[i].type;
      c[t] = (c[t] || 0) + 1;
    }
    return c;
  }

  function fmtHour(h){
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + ' ' + ap;
  }

  /* the landlord-ready report */
  function buildReport(entries, tzOffsetMin, unit){
    if (!entries.length) return 'No disturbances logged.';
    var nights = nightsAffected(entries, tzOffsetMin);
    var span = spanDays(entries, tzOffsetMin);
    var mins = totalMinutes(entries);
    var perNight = (entries.length / nights).toFixed(1);
    var worst = worstHours(entries, tzOffsetMin);
    var tc = typeCounts(entries);
    var types = Object.keys(tc).sort(function(a, b){ return tc[b] - tc[a]; });
    var first = entries.reduce(function(a, b){ return a.ts < b.ts ? a : b; });
    var last = entries.reduce(function(a, b){ return a.ts > b.ts ? a : b; });
    var lines = [];
    lines.push('NOISE DISTURBANCE LOG' + (unit ? ' - ' + unit : ''));
    lines.push('Period: ' + localDateStr(first.ts, tzOffsetMin) + ' to ' + localDateStr(last.ts, tzOffsetMin) + ' (' + span + ' day' + (span === 1 ? '' : 's') + ')');
    lines.push('Incidents: ' + entries.length + ' across ' + nights + ' nights (' + perNight + ' per affected night)');
    lines.push('Total disturbance time: ' + mins + ' minutes');
    var tparts = [];
    for (var i = 0; i < types.length; i++) tparts.push(types[i] + ' (' + tc[types[i]] + ')');
    lines.push('Types: ' + tparts.join(', '));
    if (worst.length){
      var wparts = [];
      for (var j = 0; j < worst.length; j++) wparts.push(fmtHour(worst[j].hour) + ' (' + worst[j].count + ' incidents)');
      lines.push('Worst hours: ' + wparts.join(', '));
    }
    lines.push('');
    lines.push('Log:');
    var sorted = entries.slice().sort(function(a, b){ return a.ts - b.ts; });
    for (var k = 0; k < sorted.length; k++){
      var e = sorted[k];
      lines.push('  ' + localDateStr(e.ts, tzOffsetMin) + ' ' + fmtHour(localHour(e.ts, tzOffsetMin)) + ' - ' + e.type + ', ' + e.minutes + ' min');
    }
    return lines.join('\n');
  }

  return {
    localDateStr: localDateStr,
    localHour: localHour,
    nightsAffected: nightsAffected,
    totalMinutes: totalMinutes,
    spanDays: spanDays,
    hourHistogram: hourHistogram,
    worstHours: worstHours,
    typeCounts: typeCounts,
    fmtHour: fmtHour,
    buildReport: buildReport
  };
});
