(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['sorok/sorok-alap'] = {
    title: 'Series, partial sums, geometric series',
    lead: 'A series is not a sum but a sequence: the sequence of partial sums. The series is convergent when this sequence is convergent — and the sum is its limit.',
    why: [
      R`We cannot add infinitely many terms "all at once", so we add them gradually: $s_1=a_1$, $s_2=a_1+a_2$, $s_3=a_1+a_2+a_3$, and so on. The series $\sum a_n$ is convergent if the sequence of partial sums $(s_n)$ is convergent, and then the sum of the series is $\lim s_n$. This definition explains why the sum of a series can be finite while we add infinitely many positive terms: the terms added are smaller and smaller, and the partial sums approach a limit.`,
      R`The geometric series is the model on which every other comparison is built. If $|q|<1$, the terms $q^n$ tend to zero quickly, and the partial sum formula is $\frac{1-q^{n+1}}{1-q}$, whose limit is $\frac{1}{1-q}$. If $|q|\ge1$, the terms do not tend to zero (or even grow), so the series diverges. Most of the tests also come from these two cases.`
    ],
    when: 'It is the basis of every sequence/series problem. The most common exam question: is the series convergent, and if so, what is its sum? Closed formulas for the sum exist in only a few cases: geometric series, telescoping series, and a few notable series. In all other cases the tests only decide convergence; they do not give the sum.',
    theory: [
      { title: 'Infinite series, partial sums', body: R`Let $(a_n)$ be a real sequence. The $n$-th partial sum of the series $\sum_{n=1}^{\infty}a_n$ is $s_n=a_1+a_2+\cdots+a_n$. The series is convergent if the sequence $(s_n)$ is convergent; its sum is then $S=\lim_{n\to\infty}s_n$. If the limit does not exist (or is infinite), the series is divergent.` },
      { title: 'Geometric series', note: R`With a general first term: $\sum_{n=0}^\infty aq^n=\frac{a}{1-q}$. If $|q|\ge1$, the series is divergent.` },
      { title: 'A necessary condition for convergence', body: R`\sum_{n=1}^{\infty}a_n\ \text{convergent}\ \Longrightarrow\ a_n\to0.` },
      { title: 'Why does the harmonic series diverge?', body: R`Group the terms: $1+\frac12+\left(\frac13+\frac14\right)+\left(\frac15+\cdots+\frac18\right)+\cdots$. Each bracketed block contains $2^k$ terms, and each is at least $\frac{1}{2^{k+1}}$, so the sum of the block is at least $\frac12$. There are infinitely many such blocks, hence the partial sums are unbounded: $s_{2^k}\ge 1+\frac{k}{2}\to\infty$.` },
      { title: 'The $p$-series', body: R`\sum_{n=1}^{\infty}\frac{1}{n^p}\ \text{convergent}\iff p>1.` },
      { title: 'Telescoping series', body: R`If the term can be written in the form $a_n=b_n-b_{n+1}$, then $s_n=b_1-b_{n+1}$, so the sum of the series is $b_1-\lim b_{n+1}$. For example $\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$, hence $\sum_{n=1}^\infty\frac{1}{n(n+1)}=1$.` },
      { title: 'Operations with convergent series', note: R`Valid only if both series are convergent. The difference of two divergent series may be convergent, so we never conclude divergence in this way.` },
      { title: 'Typical mistakes', body: R`The $\sum$ sign must not be treated like an ordinary sum: rearranging the terms of an infinite series is not always allowed. Nor is $a_n\to0$ enough for convergence — the harmonic series refutes this. Finally: the splitting $\sum(a_n+b_n)$ may be used only if the two series are separately convergent.` }
    ],
    examples: [
      {
        title: 'Sum of a geometric series',
        problem: R`Compute: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{2^n}$.`,
        steps: [
          R`This is a geometric series with $a_1=\frac12$ and $q=\frac12$.`,
          R`Since $|q|=\frac12<1$, the series is convergent.`,
          R`The sum: $S=\frac{a_1}{1-q}=\frac{1/2}{1-1/2}=1$.`,
          R`Check with a partial sum: $s_n=1-\frac{1}{2^n}\to1$.`
        ],
        answer: R`$1$`
      },
      {
        title: 'Telescoping series',
        problem: R`Compute: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n(n+1)}$.`,
        steps: [
          R`Split into partial fractions: $\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$.`,
          R`The partial sum: $s_n=\left(1-\frac12\right)+\left(\frac12-\frac13\right)+\cdots+\left(\frac1n-\frac1{n+1}\right)$.`,
          R`Every inner term cancels: $s_n=1-\frac{1}{n+1}$.`,
          R`Limit: $\lim s_n=1$, so the sum of the series is 1.`
        ],
        answer: R`$1$`
      },
      {
        title: 'Divergence of the harmonic series',
        problem: R`Show that $\displaystyle\sum_{n=1}^{\infty}\frac1n$ is divergent, even though its terms tend to zero.`,
        steps: [
          R`For the terms, $a_n=\frac1n\to0$, so the necessary condition holds — but this does not decide anything yet.`,
          R`Group the terms as $1$, $\frac12$, $\frac13+\frac14$, $\frac15+\cdots+\frac18$, etc.`,
          R`The $k$-th block contains $2^k$ terms, each at least $\frac{1}{2^{k+1}}$, so the sum of the block is at least $\frac12$.`,
          R`Thus $s_{2^k}\ge1+\frac{k}{2}$, which exceeds every bound, so the partial sums are unbounded: the series is divergent.`
        ],
        answer: R`Divergent`
      },
      {
        title: R`Comparison with a $p$-series`,
        problem: R`Is $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2}$ convergent?`,
        steps: [
          R`This is a $p$-series with $p=2$.`,
          R`By the $p$-series criterion it is convergent for $p>1$.`,
          R`It can also be seen directly: $\frac{1}{n^2}\le\frac{1}{n(n-1)}$ for every $n\ge2$, and $\sum\frac{1}{n(n-1)}$ is telescoping, hence convergent.`,
          R`By the majorant test the original series is also convergent.`
        ],
        answer: R`Convergent`
      }
    ],
    mistakes: [
      R`Thinking that $a_n\to0$ is already enough for convergence (the harmonic series is a counterexample).`,
      R`Using the geometric series formula also for $|q|\ge1$.`,
      R`Confusing the partial sum with the sum of the series: $s_n$ is finite, the sum of the series is the limit.`,
      R`Splitting the difference of two series term by term when one (or both) is divergent.`
    ],
    exercises: [
      { q: R`Compute: $\displaystyle\sum_{n=0}^{\infty}\left(\frac13\right)^n$.`, hint: R`$a=1$, $q=\frac13$: $\frac{a}{1-q}$.`, sol: R`$\frac{1}{1-1/3}=\frac{3}{2}$.` },
      { q: R`Compute: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{4^n}$.`, hint: R`First term $\frac14$, ratio $\frac14$.`, sol: R`$\frac{1/4}{1-1/4}=\frac{1/4}{3/4}=\frac13$.` },
      { q: R`Compute: $\displaystyle\sum_{n=1}^{\infty}\frac{5}{2^n}$.`, hint: R`Factor out 5 and use the result $\sum\frac{1}{2^n}=1$.`, sol: R`$5\cdot\sum_{n=1}^\infty\frac{1}{2^n}=5\cdot1=5$.` },
      { q: R`Compute: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n(n+1)}$.`, hint: R`$\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$, telescoping.`, sol: R`$s_n=1-\frac{1}{n+1}\to1$.` },
      { q: R`Convergent or divergent: $\displaystyle\sum_{n=1}^{\infty}\frac1n$?`, choices: ['Convergent', 'Divergent'], sol: R`The harmonic series is divergent: the terms tend to zero, but the partial sums are unbounded.` },
      { q: R`Convergent or divergent: $\displaystyle\sum_{n=1}^{\infty}\frac{n}{n+1}$?`, choices: ['Convergent', 'Divergent'], sol: R`$a_n=\frac{n}{n+1}\to1\neq0$, so the necessary condition fails: the series is divergent.` },
      { q: R`Convergent or divergent: $\displaystyle\sum_{n=1}^{\infty}2^n$?`, choices: ['Convergent', 'Divergent'], sol: R`Geometric series with ratio $q=2>1$; the terms do not tend to zero: divergent.` },
      { q: R`Prove that the harmonic series is divergent.`, hint: R`Group the terms into blocks containing $2^k$ terms and bound each block from below.`, sol: R`Consider the blocks: $1$, $\frac12$, $\frac13+\frac14$, $\frac15+\cdots+\frac18$; in general the $k$-th block consists of the terms $\frac{1}{2^k+1},\dots,\frac{1}{2^{k+1}}$. It contains $2^k$ terms, and each is at least $\frac{1}{2^{k+1}}$, so the sum of the block is at least $2^k\cdot\frac{1}{2^{k+1}}=\frac12$. After the first $k$ blocks the partial sum is at least $1+\frac{k}{2}$, which tends to infinity as $k\to\infty$. Hence the partial sums are unbounded and the series is divergent.` }
    ],
    video: { title: 'Essence of calculus', channel: '3Blue1Brown' }
  };

  MB.enContent['sorok/sorok-kriteriumok'] = {
    title: 'Majorant, minorant, ratio, root',
    lead: 'The tests do not compute the sum; they decide whether it exists. That is why you always have to look at the shape of the term: factorial, $n$-th power, or rational function.',
    why: [
      R`Behind the comparison tests there is a single idea: if a series with nonnegative terms can be bounded from above by a convergent series (majorant), then its partial sums are bounded, hence they converge. Conversely: if it is bounded from below by a divergent series, then the partial sums are unbounded, hence it diverges. For this one always needs a known reference series: most often the geometric series or the $p$-series.`,
      R`The ratio and root tests carry out the same comparison with a geometric series automatically. If the ratio of neighbouring terms (or the $n$-th root of the term) has limit $q<1$, then the series behaves "quasi-geometrically", hence it converges. If $q>1$, the terms do not tend to zero, hence it diverges. In the case $q=1$ the test says nothing, because then the series sits exactly on the boundary of the $p$-series — another test is needed.`
    ],
    when: 'Factorial or $n$-th power in the term: ratio or root test. A rational function in $n$: limit comparison with a $p$-series. A mixed, complicated term: a majorant estimate by a simpler series. If the series alternates in sign, it is worth examining absolute convergence first — if that holds, we are done.',
    theory: [
      { title: 'Majorant and minorant test', body: R`If $0\le a_n\le b_n$ for every $n$ and $\sum b_n$ is convergent, then $\sum a_n$ is also convergent. If $0\le b_n\le a_n$ and $\sum b_n$ is divergent, then $\sum a_n$ is also divergent.` },
      { title: 'Limit comparison test', body: R`If $a_n,b_n>0$ and $\dfrac{a_n}{b_n}\to c$ for some constant $0<c<\infty$, then $\sum a_n$ and $\sum b_n$ are simultaneously convergent or divergent.` },
      { title: 'Ratio test', body: R`Let $a_n>0$ and $\lim_{n\to\infty}\dfrac{a_{n+1}}{a_n}=q.$ If $q<1$, the series is convergent; if $q>1$ (or $q=\infty$), the series is divergent; if $q=1$, the test does not decide.` },
      { title: 'Root test', body: R`Let $a_n\ge0$ and $\lim_{n\to\infty}\sqrt[n]{a_n}=q.$ Then the series is convergent for $q<1$, divergent for $q>1$, and the test does not decide for $q=1$.` },
      { title: 'Absolute convergence', body: R`\sum|a_n|\ \text{convergent}\ \Longrightarrow\ \sum a_n\ \text{convergent},` },
      { title: 'Which test should we choose?', body: R`Factorial in the term: ratio test, because the ratio of factorials simplifies. $n$-th power (e.g. $\left(\frac{n}{2n+1}\right)^n$): root test. A rational function in $n$: limit comparison with a $p$-series, decided by the highest degree of the denominator. A mixed product (e.g. $\frac{n^2}{2^n}$): ratio test, because the exponential factor dominates.` },
      { title: 'The $q=1$ trap', body: R`The case $q=1$ does not mean that the series is convergent or divergent — it means that this test is not applicable. For example, for $\sum\frac1n$ and $\sum\frac{1}{n^2}$ the limit in the ratio test is 1 in both cases, yet the first is divergent and the second convergent. In such cases a comparison with a $p$-series or the integral test is needed.` },
      { title: 'Reference series', items: [
        R`Geometric: $\sum q^n$ is convergent if $|q|<1$.`,
        R`$p$-series: $\sum\frac{1}{n^p}$ is convergent if $p>1$.`,
        R`$\sum\frac{1}{n(\ln n)^p}$ is convergent if $p>1$ (by the integral test).`,
        R`$\sum\frac{1}{n!}$ is convergent (ratio test: $q=0$).`
      ] }
    ],
    examples: [
      {
        title: 'The ratio test also works without factorials',
        problem: R`Is $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2^n}$ convergent?`,
        steps: [
          R`The term is $a_n=\frac{n}{2^n}>0$; compute the ratio: $\frac{a_{n+1}}{a_n}=\frac{(n+1)/2^{n+1}}{n/2^n}$.`,
          R`Simplifying: $\frac{n+1}{n}\cdot\frac{2^n}{2^{n+1}}=\frac{n+1}{2n}$.`,
          R`Limit: $\frac{n+1}{2n}\to\frac12<1$.`,
          R`By the ratio test the series is convergent. (Its sum is 2, incidentally.)`
        ],
        answer: R`Convergent`
      },
      {
        title: 'Majorant estimate',
        problem: R`Is $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2+1}$ convergent?`,
        steps: [
          R`For every $n$, $n^2+1>n^2$, hence $\frac{1}{n^2+1}<\frac{1}{n^2}$.`,
          R`The series $\sum\frac{1}{n^2}$ is convergent because $p=2>1$.`,
          R`By the majorant test, therefore, $\sum\frac{1}{n^2+1}$ is also convergent.`,
          R`We do not know the sum in closed form; the test only gives convergence.`
        ],
        answer: R`Convergent`
      },
      {
        title: 'Geometric series via the ratio test',
        problem: R`Is $\displaystyle\sum_{n=1}^{\infty}\left(\frac23\right)^n$ convergent, and what is its sum?`,
        steps: [
          R`Geometric series with $q=\frac23$ and first term $a_1=\frac23$.`,
          R`$|q|<1$, hence convergent.`,
          R`Sum: $S=\frac{a_1}{1-q}=\frac{2/3}{1/3}=2$.`,
          R`Also by the ratio test: $\frac{a_{n+1}}{a_n}=\frac23<1$, the same result.`
        ],
        answer: R`Convergent, sum $2$`
      }
    ],
    mistakes: [
      R`Concluding convergence (or divergence) from the case $q=1$.`,
      R`Applying the ratio test to an alternating series without preparation — one must take absolute values.`,
      R`Estimating in the wrong direction in a majorant test: the bound must be from above by a convergent series.`,
      R`Comparing $\sum\frac{1}{n^2+1}$ with $\sum\frac1n$ instead of $\sum\frac{1}{n^2}$, and concluding divergence from that.`
    ],
    exercises: [
      { q: R`Compute: $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2^n}$.`, hint: R`$\sum nq^n=\frac{q}{(1-q)^2}$ for $|q|<1$, here $q=\frac12$.`, sol: R`$\frac{1/2}{(1/2)^2}=2$. Check: $s_n=2-\frac{n+2}{2^n}\to2$.` },
      { q: R`Convergent or divergent: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2+1}$?`, choices: ['Convergent', 'Divergent'], sol: R`$\frac{1}{n^2+1}<\frac{1}{n^2}$, and $\sum\frac{1}{n^2}$ is convergent ($p=2$), so by the majorant test it is convergent.` },
      { q: R`Convergent or divergent: $\displaystyle\sum_{n=1}^{\infty}\frac{n}{n^2+1}$?`, choices: ['Convergent', 'Divergent'], sol: R`$\frac{n}{n^2+1}\sim\frac1n$: the limit of the ratio is 1, so it behaves like the harmonic series, that is, it diverges.` },
      { q: R`For the series $\displaystyle\sum_{n=1}^{\infty}\frac{2^n}{n!}$, what limit ($q$) does the ratio test give?`, hint: R`$\frac{a_{n+1}}{a_n}=\frac{2}{n+1}$.`, sol: R`$\frac{2^{n+1}/(n+1)!}{2^n/n!}=\frac{2}{n+1}\to0<1$, hence convergent (its sum is $e^2-1$).` },
      { q: R`Convergent or divergent: $\displaystyle\sum_{n=1}^{\infty}\frac{n!}{n^n}$?`, choices: ['Convergent', 'Divergent'], sol: R`$\frac{a_{n+1}}{a_n}=\frac{(n+1)!}{(n+1)^{n+1}}\cdot\frac{n^n}{n!}=\left(\frac{n}{n+1}\right)^n\to\frac1e<1$, hence convergent.` },
      { q: R`What does the root test give for the series $\displaystyle\sum_{n=1}^{\infty}\left(\frac{n}{2n+1}\right)^n$? Give the limit.`, hint: R`$\sqrt[n]{a_n}=\frac{n}{2n+1}$.`, sol: R`The root is exactly $\frac{n}{2n+1}\to\frac12<1$, so the series is convergent.` },
      { q: R`Convergent or divergent: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{\sqrt n}$?`, choices: ['Convergent', 'Divergent'], sol: R`$p$-series with $p=\frac12<1$, hence divergent.` },
      { q: R`Prove that if $\sum|a_n|$ is convergent, then $\sum a_n$ is also convergent.`, hint: R`Use the Cauchy criterion and the triangle inequality on the difference of the partial sums.`, sol: R`Let $(s_n)$ be the sequence of partial sums of $\sum a_n$ and $(S_n)$ that of $\sum|a_n|$. Since $\sum|a_n|$ is convergent, $(S_n)$ is a Cauchy sequence: for every $\varepsilon>0$ there is an $N$ such that for $m>n>N$ we have $S_m-S_n=\sum_{k=n+1}^{m}|a_k|<\varepsilon$. Then by the triangle inequality $|s_m-s_n|=\left|\sum_{k=n+1}^{m}a_k\right|\le\sum_{k=n+1}^{m}|a_k|<\varepsilon$, so $(s_n)$ is also a Cauchy sequence. A real sequence is convergent exactly when it is Cauchy, hence $\sum a_n$ is convergent.` }
    ],
    video: { title: 'Essence of calculus', channel: '3Blue1Brown' }
  };

  MB.enContent['sorok/sorok-leibniz'] = {
    title: 'Alternating series, absolute and conditional convergence',
    lead: 'If the signs of the terms alternate and their magnitudes decrease monotonically to zero, the series is convergent — and the error made with a partial sum is simply the next term.',
    why: [
      R`For alternating series the two sequences of partial sums (even and odd index) approach each other like a closing pair of scissors. If the magnitudes of the terms decrease monotonically and tend to zero, then the even partial sums increase, the odd ones decrease, and the two sequences tend to the same limit. This is the content of the Leibniz test. It is important that monotonicity is also needed: terms tending to zero is not enough by itself.`,
      R`Absolute convergence is a stronger property than mere convergence. If the series formed from the absolute values is also convergent, then the series tends to the same sum under every rearrangement — that is why one can compute with it "normally". For conditional convergence this is not true: by Riemann's rearrangement theorem, reordering the terms can produce any sum (or divergence). That is why the two must always be distinguished.`
    ],
    when: R`For alternating series we always examine absolute convergence first. If it holds, we are done. If not, the Leibniz test comes next. The error estimate ($|s-s_n|\le c_{n+1}$) is useful when we want to approximate the sum, for example in computing $\ln 2$ or $\pi/4$. The exam often asks for the distinction "conditionally or absolutely convergent".`,
    theory: [
      { title: 'Alternating series', body: R`A series of the form $\sum_{n=1}^{\infty}(-1)^n c_n$ or $\sum_{n=1}^{\infty}(-1)^{n+1}c_n$ with $c_n>0$ for every $n$ is called an alternating series. Here $c_n$ is the magnitude of the term and the sign is given by the factor $(-1)^n$.` },
      { title: 'Leibniz test', body: R`If $c_n>0$, the sequence $(c_n)$ is monotonically decreasing ($c_{n+1}\le c_n$) and $c_n\to0$, then the series $\sum(-1)^n c_n$ is convergent.` },
      { title: 'Error estimate', body: R`For the sum $S$ of a Leibniz series and the partial sum $s_n$:
|S-s_n|\le c_{n+1},` },
      { title: 'Absolute and conditional convergence', body: R`The series $\sum a_n$ is absolutely convergent if $\sum|a_n|$ is convergent. It is conditionally convergent if $\sum a_n$ is convergent but $\sum|a_n|$ is divergent. Every rearrangement of an absolutely convergent series tends to the same sum; for a conditionally convergent series this is not true.` },
      { title: 'Why is conditional convergence dangerous?', body: R`The series $\sum(-1)^{n+1}\frac1n$ is conditionally convergent. By Riemann's rearrangement theorem, changing the order of the terms can give any real number as the sum — indeed, a divergent series can also be produced. That is why infinite series must not be treated as "finite sums": bracketing and rearranging are allowed only in the absolutely convergent case.` },
      { title: 'A notable conditionally convergent series', note: R`Its absolute-value counterpart is the harmonic series, which is divergent — hence it is conditional.` },
      { title: 'The Leibniz conditions do not hold automatically', body: R`For the series $\sum(-1)^n\frac{n}{n+1}$ we have $c_n=\frac{n}{n+1}\to1\neq0$, so the series already fails the necessary condition: it is divergent. Monotonicity must also be checked: for $c_n=\frac{1}{\ln n}$ it decreases from $n\ge2$, but it is not defined at $n=1$ — in such cases we examine the series from $n=2$, since omitting finitely many terms does not change convergence.` },
      { title: 'Order of checking', items: [
        R`First: does $a_n\to0$? If not, the series is divergent.`,
        R`Absolutely convergent? If yes, done (a stronger statement).`,
        R`If not: do the Leibniz conditions (positivity, monotonicity, tending to zero) hold?`,
        R`Error estimate: the error is at most the magnitude of the next term.`
      ] }
    ],
    examples: [
      {
        title: 'A conditionally convergent series',
        problem: R`Examine the series $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n}{\sqrt n}$.`,
        steps: [
          R`The magnitude of the term is $c_n=\frac{1}{\sqrt n}>0$, and $c_n$ decreases monotonically, because $\sqrt n$ increases.`,
          R`$c_n\to0$, so the conditions of the Leibniz test hold: the series is convergent.`,
          R`For absolute convergence we look at $\sum\frac{1}{\sqrt n}$: this has $p=\frac12<1$, hence it is divergent.`,
          R`The series is therefore conditionally convergent.`
        ],
        answer: R`Conditionally convergent`
      },
      {
        title: 'The alternating harmonic series',
        problem: R`Is $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}$ convergent, and what is its sum?`,
        steps: [
          R`$c_n=\frac1n>0$, it decreases monotonically, and $c_n\to0$: by Leibniz it is convergent.`,
          R`In absolute value we get the harmonic series, which is divergent.`,
          R`So it is conditionally convergent, and the sum is the notable result $\ln 2$.`,
          R`Check: $s_{1000}\approx0{,}6926$, close to $\ln 2\approx0{,}6931$.`
        ],
        answer: R`Conditionally convergent, sum $\ln 2$`
      },
      {
        title: 'Estimating the error after 99 terms',
        problem: R`We approximate the sum of the series $\sum(-1)^{n+1}\frac1n$ by the partial sum $s_{99}$. What is the error at most?`,
        steps: [
          R`The Leibniz error estimate: $|S-s_{99}|\le c_{100}$.`,
          R`$c_{100}=\frac{1}{100}=0{,}01$.`,
          R`So the error is at most $0{,}01$.`,
          R`In reality it is much smaller, because the estimate is only an upper bound: $\ln2-s_{99}\approx0{,}005$.`
        ],
        answer: R`$|S-s_{99}|\le0{,}01$`
      }
    ],
    mistakes: [
      R`Applying the Leibniz test without monotonicity: tending to zero is not enough by itself.`,
      R`Confusing convergence with absolute convergence: $\sum\frac{(-1)^n}{\sqrt n}$ is convergent but not absolutely convergent.`,
      R`Rearranging or arbitrarily bracketing the terms of a conditionally convergent series.`,
      R`Writing the error estimate with $c_n$ instead of $c_{n+1}$: the error of the $n$-term partial sum is bounded by the next term.`
    ],
    exercises: [
      { q: R`What type of convergence does the series $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n}{\sqrt n}$ have?`, choices: ['Absolutely convergent', 'Conditionally convergent', 'Divergent'], sol: R`By Leibniz it is convergent, but $\sum\frac{1}{\sqrt n}$ is divergent because $p=\frac12<1$, hence it is conditional.` },
      { q: R`What is the sum of the series $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}$?`, hint: R`The notable sum of the alternating harmonic series.`, sol: R`The sum is $\ln 2\approx0{,}6931$.` },
      { q: R`We approximate the sum of the series $\sum(-1)^{n+1}/n$ by $s_{99}$. Give the upper bound of the error estimate.`, hint: R`$|S-s_n|\le c_{n+1}$.`, sol: R`$c_{100}=\frac{1}{100}=0{,}01$.` },
      { q: R`Convergent or divergent: $\displaystyle\sum_{n=1}^{\infty}(-1)^n\frac{n}{n+1}$?`, choices: ['Convergent', 'Divergent'], sol: R`$c_n=\frac{n}{n+1}\to1\neq0$, so the terms do not tend to zero: divergent.` },
      { q: R`Is the series $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n}{n^2}$ absolutely convergent?`, choices: ['Yes', 'No'], sol: R`$\sum\frac{1}{n^2}$ is convergent because $p=2>1$, so the series is absolutely convergent.` },
      { q: R`We approximate the sum of the series $\sum(-1)^{n+1}/n^2$ by $s_9$. Give the upper bound of the error estimate.`, hint: R`$c_{10}=\frac{1}{10^2}$.`, sol: R`$|S-s_9|\le c_{10}=\frac{1}{100}=0{,}01$.` },
      { q: R`Is the series $\displaystyle\sum_{n=2}^{\infty}\frac{(-1)^n}{\ln n}$ convergent or divergent?`, choices: ['Convergent', 'Divergent'], sol: R`$c_n=\frac{1}{\ln n}$ decreases monotonically from $n\ge2$ and tends to zero, so by Leibniz it is convergent (in absolute value it diverges, because $\frac{1}{\ln n}\ge\frac1n$ for large enough $n$).` },
      { q: R`Prove the Leibniz error estimate: if $c_n\searrow0$, then $|S-s_n|\le c_{n+1}$.`, hint: R`Write the remainder as $S-s_n=(-1)^{n+1}\left(c_{n+1}-c_{n+2}+c_{n+3}-\cdots\right)$ and use the monotonicity of the bracketed expression.`, sol: R`The remainder is $R_n=S-s_n=(-1)^{n+1}\left(c_{n+1}-c_{n+2}+c_{n+3}-\cdots\right)$. The alternating series in the bracket is, by the Leibniz test, nonnegative and at most its first term: $0\le c_{n+1}-c_{n+2}+c_{n+3}-\cdots\le c_{n+1}$. This holds because the value of the bracket lies between the even and odd partial sums, and these lie between the values $c_{n+1}$ and $c_{n+1}-c_{n+2}$. Thus $|R_n|\le c_{n+1}$.` }
    ],
    video: { title: 'Essence of calculus', channel: '3Blue1Brown' }
  };
})();
