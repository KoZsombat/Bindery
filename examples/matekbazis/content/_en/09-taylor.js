(function () {
  const MB = window.MB;
  MB.enContent = MB.enContent || {};

  MB.enContent['taylor/taylor-polinom'] = {
    title: 'Taylor polynomial, remainder term',
    lead: 'The Taylor polynomial is the polynomial of degree at most $n$ whose first $n$ derivatives at the point $a$ agree with those of the function. The remainder term tells us how large an error we make when we replace the function by this polynomial.',
    why: [
      'If we want to fit a polynomial to a function at the point $a$, the most natural requirement is that both the value and the derivatives agree. A polynomial of degree at most $n$ has $n+1$ free coefficients, and we have exactly $n+1$ conditions: $T(a)=f(a)$, $T\'(a)=f\'(a)$, ..., $T^{(n)}(a)=f^{(n)}(a)$. This system has a unique solution, and the result is $T_n(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^k$. The $k!$ appears because differentiating the $k$-th power $k$ times produces $k!$.',
      'The remainder term is not a decorative afterthought: it is what justifies the approximation. In the Lagrange form $R_n(x)=\\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}$ for some point $\\xi$ between $a$ and $x$. Since we do not know the exact location of $\\xi$, in practice we bound it from above: if $|f^{(n+1)}|\\le M$ on the given interval, then $|R_n(x)|\\le\\frac{M}{(n+1)!}|x-a|^{n+1}$. This estimate is usually a stand-alone exam problem.'
    ],
    when: 'In limit computations (of the $\\frac{\\sin x-x}{x^3}$ type), in approximate computation (e.g. $e^{0.1}$, $\\sqrt{1{,}1}$), and in every case where a function must be replaced locally by a polynomial. The case $n=1$ is the tangent line, the case $n=2$ is the tangent parabola — these give the formulas of linearization and second-order approximation. The size of the error always depends on the distance $|x-a|$ and on the bound for the derivative.',
    theory: [
      { title: 'Taylor polynomial', body: 'The Taylor polynomial of degree $n$ of the function $f$ about the point $a$ is\nT_n(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^k.' },
      { title: 'Where do the coefficients come from?', body: 'Write the polynomial in the form $T_n(x)=c_0+c_1(x-a)+\\cdots+c_n(x-a)^n$. At $x=a$ we have $T_n(a)=c_0$, so $c_0=f(a)$. Differentiating, $T_n\'(x)=c_1+2c_2(x-a)+\\cdots$, hence $T_n\'(a)=c_1=f\'(a)$. At the $k$-th derivative the $k$-th term gives $k!c_k$ and all other terms vanish, so $c_k=\\frac{f^{(k)}(a)}{k!}$. This derivation also shows uniqueness.' },
      { title: 'Writing down the Taylor polynomial', note: 'The case $a=0$ is called the Maclaurin polynomial. The case $n=1$ is the equation of the tangent line.' },
      { title: 'Taylor theorem with Lagrange remainder', body: 'If $f$ is $n+1$ times differentiable in a neighbourhood of $a$, then\nf(x)=T_n(x)+R_n(x),\\qquad R_n(x)=\\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1},' },
      { title: 'How do we estimate in practice?', body: 'The point $\\xi$ is unknown, so we have to give an upper bound for the derivative on the interval between $a$ and $x$: if $|f^{(n+1)}(t)|\\le M$ for every relevant $t$, then $|R_n(x)|\\le\\frac{M}{(n+1)!}|x-a|^{n+1}$. The procedure: (1) write down $T_n$; (2) bound the appropriate derivative on the interval; (3) substitute into the formula.' },
      { title: 'The error is not automatically small', body: 'The Taylor polynomial is only good in a neighbourhood of the point $a$. If $|x-a|$ is large, the factor $(x-a)^{n+1}$ can make the error grow, and even the infinite Taylor series may diverge. For example, the series of $\\ln(1+x)$ diverges for $x>1$. The radius of convergence is not decoration: outside it the series does not describe the function.' },
      { title: 'Quick checks', items: [
        '$T_n(a)=f(a)$, and $T_n^{(k)}(a)=f^{(k)}(a)$ for every $k\\le n$.',
        'The degree of $T_n$ is at most $n$; if $f$ itself is a polynomial of degree $n$, then $T_n=f$ exactly.',
        'For $n=1$ we get the tangent line: $f(a)+f\'(a)(x-a)$.',
        'For an even function the Maclaurin polynomial contains only even powers, for an odd function only odd powers.'
      ] }
    ],
    examples: [
      {
        title: 'The exponential function',
        problem: 'Write down the Taylor polynomial of $f(x)=e^x$ about $a=0$ for general $n$.',
        steps: [
          'Every derivative is $e^x$, and $e^0=1$, so $f^{(k)}(0)=1$ for every $k$.',
          'Substituting: $T_n(x)=1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\cdots+\\frac{x^n}{n!}$.',
          'The remainder: $R_n(x)=\\frac{e^{\\xi}}{(n+1)!}x^{n+1}$ for some point $\\xi$ between $0$ and $x$.',
          'Since $e^\\xi$ is bounded on the given interval, the remainder tends to zero for every fixed $x$ as $n\\to\\infty$.'
        ],
        answer: '$T_n(x)=\\sum_{k=0}^{n}\\dfrac{x^k}{k!}$'
      },
      {
        title: 'The sine function',
        problem: 'Write down the Maclaurin polynomial of $\\sin x$ up to $n=5$.',
        steps: [
          'The derivatives are cyclic: $\\sin x$, $\\cos x$, $-\\sin x$, $-\\cos x$. At zero: $0,1,0,-1,0,1,\\dots$',
          'Only the terms with odd powers survive, with alternating signs.',
          '$T_3(x)=x-\\frac{x^3}{3!}$, then $T_5(x)=x-\\frac{x^3}{3!}+\\frac{x^5}{5!}$.',
          'So $T_5(x)=x-\\frac{x^3}{6}+\\frac{x^5}{120}$. The next non-zero term is $-\\frac{x^7}{5040}$.'
        ],
        answer: '$T_5(x)=x-\\dfrac{x^3}{6}+\\dfrac{x^5}{120}$'
      },
      {
        title: 'Approximating $e^{0.1}$',
        problem: 'Estimate $e^{0.1}$ using the second-degree Maclaurin polynomial.',
        steps: [
          '$T_2(x)=1+x+\\frac{x^2}{2}$.',
          'Substituting $x=0{,}1$: $1+0{,}1+0{,}005=1{,}105$.',
          'The actual value is $e^{0{,}1}\\approx1{,}10517$, so the approximation is very good.',
          'The order of magnitude of the error: $\\frac{e^{0{,}1}\\cdot0{,}1^3}{6}\\approx1{,}8\\cdot10^{-4}$.'
        ],
        answer: '$e^{0{,}1}\\approx1{,}105$'
      },
      {
        title: 'Error estimate with the Lagrange remainder',
        problem: 'Bound the error $|e^{0{,}1}-T_2(0{,}1)|$ from above using the given bound $e^{\\xi}\\le3$.',
        steps: [
          'The remainder formula for $n=2$: $R_2(x)=\\frac{e^{\\xi}}{3!}x^3$ for some $0<\\xi<0{,}1$.',
          'We use that $e^{\\xi}\\le3$ on this interval.',
          '$|R_2(0{,}1)|\\le\\frac{3}{6}\\cdot0{,}001=0{,}0005$.',
          'So the error is at most $5\\cdot10^{-4}$, which is consistent with the true error $1{,}7\\cdot10^{-4}$.'
        ],
        answer: '$|R_2(0{,}1)|\\le0{,}0005$'
      }
    ],
    mistakes: [
      'Omitting the factorial in the denominator: the term is $\\frac{f^{(k)}(a)}{k!}x^k$, not $f^{(k)}(a)x^k$.',
      'Computing with $n$ instead of $n+1$ in the remainder term: the error of the degree $n$ polynomial depends on the $(n+1)$-th derivative.',
      'In the error estimate, taking the maximum of the derivative at the point $a$ instead of on the given interval.',
      'Believing that the polynomial is a good approximation even for large $|x-a|$ — the Taylor series describes the function only inside its region of convergence.'
    ],
    exercises: [
      { q: 'Write down the second-degree Maclaurin polynomial of $\\cos x$.', hint: '$\\cos0=1$, $\\cos\'0=0$, $\\cos\'\'0=-1$.', sol: '$T_2(x)=1-\\frac{x^2}{2!}=1-\\frac{x^2}{2}$.' },
      { q: 'Write down the third-degree Maclaurin polynomial of $e^x$.', hint: 'Every derivative equals 1 at zero.', sol: '$T_3(x)=1+x+\\frac{x^2}{2}+\\frac{x^3}{6}$.' },
      { q: 'Approximate $e^{0{,}1}$ with the second-degree Maclaurin polynomial.', hint: '$1+x+\\frac{x^2}{2}$, $x=0{,}1$.', sol: '$1+0{,}1+0{,}005=1{,}105$.' },
      { q: 'Give an upper bound for the error of the approximation above using the Lagrange remainder, given $e^{\\xi}\\le3$.', hint: '$\\frac{M}{(n+1)!}|x-a|^{n+1}$ with $M=3$, $n=2$, $x-a=0{,}1$.', sol: '$\\frac{3}{6}\\cdot0{,}001=0{,}0005$.' },
      { q: 'Write down the second-degree Taylor polynomial of $f(x)=\\sqrt x$ about $a=1$.', hint: '$f(1)=1$, $f\'(1)=\\frac12$, $f\'\'(1)=-\\frac14$.', sol: '$T_2(x)=1+\\frac12(x-1)+\\frac{-1/4}{2}(x-1)^2=1+\\frac{x-1}{2}-\\frac{(x-1)^2}{8}$.' },
      { q: 'Approximate $\\sqrt{1{,}1}$ with the previous second-degree Taylor polynomial.', hint: '$x-1=0{,}1$: $1+0{,}05-0{,}00125$.', sol: '$1+\\frac{0{,}1}{2}-\\frac{0{,}01}{8}=1+0{,}05-0{,}00125=1{,}04875$. The actual value is $1{,}04881$.' },
      { q: 'What is the coefficient of $x^4$ in the Maclaurin series of $\\sin x$?', hint: 'The sine is an odd function.', sol: '$\\sin x=x-\\frac{x^3}{6}+\\frac{x^5}{120}-\\cdots$, only odd powers occur, so the coefficient of $x^4$ is 0.' },
      { q: 'Prove that the Taylor polynomial is unique: if for a polynomial $P$ of degree at most $n$ we have $P^{(k)}(a)=f^{(k)}(a)$ for every $k=0,\\dots,n$, then $P=T_n$.', hint: 'Consider the difference $P-T_n$, and use that a polynomial of degree $n$ has at most $n$ roots.', sol: 'Let $Q=P-T_n$. Then the degree of $Q$ is at most $n$, and $Q^{(k)}(a)=0$ for every $k=0,\\dots,n$. We claim that then $Q\\equiv0$. If $Q$ is not identically zero, then $Q$ has a non-zero derivative of smallest order $m\\le n$ at $a$. Then $Q^{(m)}(a)\\neq0$, but from $Q^{(m+1)}$ upwards every derivative is zero at $a$, so $Q^{(m)}$ is constant, namely $Q^{(m)}(a)\\neq0$. Therefore $Q^{(m-1)}$ is strictly monotone, and since $Q^{(m-1)}(a)=0$, the point $a$ is a simple root. Continuing backwards, $a$ is a root of $Q$ of multiplicity exactly $m$, and $Q(x)=(x-a)^m R(x)$ for some polynomial $R$ with $R(a)\\neq0$. Since $\\deg Q\\le n$, we have $\\deg R\\le n-m$. But $Q^{(k)}(a)=0$ for every $k\\le n$, which means that $a$ is a root of $Q$ of multiplicity at least $n+1$, which for a polynomial of degree $n$ is possible only if $Q\\equiv0$. Contradiction, so $Q\\equiv0$, that is $P=T_n$.' }
    ],
    video: { title: 'Essence of calculus', channel: '3Blue1Brown' }
  };

  MB.enContent['taylor/taylor-sorok'] = {
    title: 'Standard series, binomial series',
    lead: 'If we increase the degree of the Taylor polynomial, in the limit we obtain a power series. It has a radius of convergence, and inside that radius the series reproduces the function itself.',
    why: [
      'A power series is a series of functions of the form $\\sum c_n(x-a)^n$. Every such series has a radius of convergence $R$: for $|x-a|<R$ the series converges absolutely, for $|x-a|>R$ it diverges, and for $|x-a|=R$ it must be examined separately. The radius is given by the Cauchy–Hadamard formula or — if the quotient exists — by the limit of the ratio of the coefficients. This matters because the Taylor series equals the function only in its region of convergence.',
      'The standard series are not separate formulas to memorise, but are derived from one another. The geometric series $\\frac{1}{1-x}=\\sum x^n$ is the base. Integrating it term by term gives the series of $-\\ln(1-x)$, and writing $-x$ in place of $x$ gives the series of $\\ln(1+x)$. From the series of $\\frac{1}{1+x^2}$ integration yields the series of $\\arctan$. The binomial series comes from computing the Taylor coefficients directly. If you see these few connections, you do not have to memorise the table.'
    ],
    when: 'In computing limits (with Taylor series it is much faster than with L’Hôpital’s rule), in approximating integrals, in series solutions of differential equations and in numerical methods. Typical exam problems are determining the radius of convergence, writing down a series expansion, and examining the endpoints separately. Always remember to state the region of validity of the formula as well.',
    theory: [
      { title: 'Power series and radius of convergence', body: 'Every power series $\\sum_{n=0}^{\\infty}c_n(x-a)^n$ has a unique number $R\\in[0,\\infty]$, its radius of convergence, such that for $|x-a|<R$ the series converges absolutely and for $|x-a|>R$ it diverges. The open interval $(a-R,a+R)$ is the interior of the interval of convergence; the endpoints must be examined separately.' },
      { title: 'Computing the radius', body: 'If $c_n\\neq0$ and the quotient $\\left|\\dfrac{c_n}{c_{n+1}}\\right|$ has a limit, then\nR=\\lim_{n\\to\\infty}\\left|\\frac{c_n}{c_{n+1}}\\right|.' },
      { title: 'Term-by-term differentiation and integration', body: 'Inside the interval of convergence the power series may be differentiated and integrated term by term, and the radius does not change:\n\\left(\\sum c_n(x-a)^n\\right)\'=\\sum n\\,c_n(x-a)^{n-1}.', note: 'At the endpoints the behaviour may change, so they require a separate examination.' },
      { title: 'Standard series', note: 'The validity ranges on the right are part of the formulas.' },
      { title: 'Binomial series', body: '(1+x)^{\\alpha}=\\sum_{k=0}^{\\infty}\\binom{\\alpha}{k}x^k,\\qquad \\binom{\\alpha}{k}=\\frac{\\alpha(\\alpha-1)\\cdots(\\alpha-k+1)}{k!},' },
      { title: 'How do we get a new series from an old one?', body: 'From the geometric series $\\frac{1}{1+t}=\\sum(-1)^nt^n$, writing $t=x^2$, we get the series of $\\frac{1}{1+x^2}$, and integrating it term by term gives $\\arctan x=x-\\frac{x^3}{3}+\\frac{x^5}{5}-\\cdots$. Similarly, the integral of $\\frac{1}{1+t}$ is $-\\ln(1-t)$, whence the series of $\\ln(1+x)$ comes. Differentiating the geometric series gives $\\frac{1}{(1-x)^2}=\\sum (n+1)x^n$.' },
      { title: 'The endpoints are a separate case', body: 'The radius determines only the open interval. The series of $\\ln(1+x)$ converges at $x=1$ (its sum is $\\ln2$) and diverges at $x=-1$ (harmonic series). The series of $\\arctan$ converges at both endpoints (Leibniz), and at $x=1$ it gives $\\frac{\\pi}{4}$. The series $\\sum\\frac{x^n}{n^2}$ converges absolutely at both endpoints. Therefore the endpoints must always be substituted and decided separately.' },
      { title: 'Applications', items: [
        'Limit: $\\frac{\\sin x-x}{x^3}\\to-\\frac16$, because $\\sin x-x=-\\frac{x^3}{6}+\\cdots$.',
        'Approximate integration: integrating the expansion term by term gives a good estimate.',
        'Indeterminate forms: the expansion shows which term dominates.',
        'Numerical values: computing $\\ln2$, $\\pi/4$, $e$ with the series, with error estimates.'
      ] }
    ],
    examples: [
      {
        title: 'The series of $\\ln(1+x)$',
        problem: 'Derive the Maclaurin series of $\\ln(1+x)$ and give its region of validity.',
        steps: [
          'Start from the geometric series: $\\frac{1}{1+t}=1-t+t^2-t^3+\\cdots$, $|t|<1$.',
          'Integrate both sides from $0$ to $x$: $\\ln(1+x)=\\int_0^x\\frac{dt}{1+t}$.',
          'Integrating term by term: $\\ln(1+x)=x-\\frac{x^2}{2}+\\frac{x^3}{3}-\\frac{x^4}{4}+\\cdots$.',
          'The radius is $R=1$; at the endpoint $x=1$ the series converges (Leibniz), its sum is $\\ln2$; at the endpoint $x=-1$ it diverges.',
          'So the validity is: $-1<x\\le1$.'
        ],
        answer: '$\\ln(1+x)=\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n+1}x^n}{n}$, $-1<x\\le1$'
      },
      {
        title: 'The binomial series for $\\alpha=\\frac12$',
        problem: 'Write down the first four terms of the Maclaurin series of $\\sqrt{1+x}=(1+x)^{1/2}$.',
        steps: [
          '$\\binom{1/2}{0}=1$, $\\binom{1/2}{1}=\\frac12$.',
          '$\\binom{1/2}{2}=\\frac{(1/2)(-1/2)}{2}=-\\frac18$; $\\binom{1/2}{3}=\\frac{(1/2)(-1/2)(-3/2)}{6}=\\frac{1}{16}$.',
          'So $\\sqrt{1+x}=1+\\frac{x}{2}-\\frac{x^2}{8}+\\frac{x^3}{16}-\\cdots$.',
          'The radius of convergence is $R=1$; at $x=1$ the series tends to $\\sqrt2$ (absolutely convergent), at $x=-1$ it diverges.'
        ],
        answer: '$1+\\dfrac{x}{2}-\\dfrac{x^2}{8}+\\dfrac{x^3}{16}-\\cdots$'
      },
      {
        title: 'Infinite radius of convergence',
        problem: 'Determine the radius of convergence of the power series $\\sum_{n=0}^{\\infty}\\frac{x^n}{n!}$.',
        steps: [
          'The coefficients are $c_n=\\frac{1}{n!}$.',
          '$\\left|\\frac{c_n}{c_{n+1}}\\right|=\\frac{(n+1)!}{n!}=n+1\\to\\infty$.',
          'So $R=\\infty$: the series converges for every real $x$.',
          'The sum is $e^x$, which is confirmed by estimating the remainder term in Taylor’s theorem.'
        ],
        answer: '$R=\\infty$'
      }
    ],
    mistakes: [
      'Confusing the radius of convergence with the interval of validity: the endpoints must be examined separately.',
      'Claiming that the series of $\\ln(1+x)$ diverges at $x=1$ (in fact it converges, its sum is $\\ln2$), and that it converges at $x=-1$.',
      'Omitting the $k!$ in the denominator of the binomial series.',
      'Changing the radius of convergence when integrating term by term (the radius does not change, only the behaviour at the endpoints).'
    ],
    exercises: [
      { q: 'Determine the radius of convergence of the series $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{x^n}{n}$.', hint: '$c_n=\\frac1n$: $\\left|\\frac{c_n}{c_{n+1}}\\right|=\\frac{n+1}{n}$.', sol: '$\\frac{n+1}{n}\\to1$, so $R=1$. At the endpoint $x=1$ we get the harmonic series (divergent), at $x=-1$ it converges by Leibniz.' },
      { q: 'Determine the radius of convergence of the series $\\displaystyle\\sum_{n=0}^{\\infty}n!\\,x^n$.', hint: '$\\left|\\frac{c_n}{c_{n+1}}\\right|=\\frac{1}{n+1}$.', sol: '$\\frac{1}{n+1}\\to0$, so $R=0$: the series converges only at $x=0$.' },
      { q: 'Determine the radius of convergence of the series $\\displaystyle\\sum_{n=0}^{\\infty}\\frac{(x-2)^n}{3^n}$.', hint: '$c_n=3^{-n}$: $\\left|\\frac{c_n}{c_{n+1}}\\right|=3$.', sol: '$R=3$, the interior of the interval of convergence is $(2-3,2+3)=(-1,5)$. At the endpoints the terms do not tend to zero, so the series diverges there.' },
      { q: 'What is the coefficient of $x^7$ in the Maclaurin series of $\\arctan x$?', hint: '$\\arctan x=x-\\frac{x^3}{3}+\\frac{x^5}{5}-\\frac{x^7}{7}+\\cdots$.', sol: 'The sign alternates and the denominator is the exponent: the coefficient is $-\\frac17$.' },
      { q: 'We approximate $\\ln2$ with the first three terms of the series $\\sum(-1)^{n+1}/n$. Give an upper bound for the error estimate.', hint: 'Leibniz: the error is at most the next term, $c_4=\\frac14$.', sol: '$|S-s_3|\\le c_4=\\frac14=0{,}25$.' },
      { q: 'Approximate $\\sqrt{1{,}01}$ with the first two terms of the binomial series.', hint: '$1+\\frac{x}{2}$, $x=0{,}01$.', sol: '$1+\\frac{0{,}01}{2}=1{,}005$. The third term is $-\\frac{x^2}{8}\\approx-1{,}25\\cdot10^{-5}$, so the approximation is very accurate.' },
      { q: 'Determine the radius of convergence of the series $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{x^n}{n^2}$.', hint: '$c_n=\\frac{1}{n^2}$.', sol: '$\\left|\\frac{c_n}{c_{n+1}}\\right|=\\frac{(n+1)^2}{n^2}\\to1$, so $R=1$. It converges absolutely at both endpoints.' },
      { q: 'Derive the Maclaurin series of $\\ln(1+x)$ by integrating the geometric series term by term, and justify the region of validity.', hint: '$\\frac{1}{1+t}=\\sum(-1)^nt^n$ for $|t|<1$; integrate from $0$ to $x$.', sol: 'The geometric series: $\\frac{1}{1+t}=1-t+t^2-t^3+\\cdots$ for every $|t|<1$. Integrating both sides from $0$ to $x$ (where $|x|<1$): $\\ln(1+x)=\\int_0^x\\frac{dt}{1+t}=x-\\frac{x^2}{2}+\\frac{x^3}{3}-\\cdots$. A power series may be integrated term by term inside its interval of convergence, and the radius does not change, so the equality holds for $|x|<1$. At the endpoint $x=1$ the resulting series is $\\sum\\frac{(-1)^{n+1}}{n}$, which converges by the Leibniz criterion, and by Abel’s theorem, because of the continuity of the sum, its value is $\\ln2$; at the point $x=-1$ it diverges because of the harmonic series. Hence the validity is $-1<x\\le1$.' }
    ],
    video: { title: 'Essence of calculus', channel: '3Blue1Brown' }
  };
})();
