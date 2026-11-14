(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['integralas/integral-alap'] = {
    title: 'Indefinite integral, substitution',
    lead: 'The indefinite integral is nothing but differentiation run backwards. That is why every integration can be checked: differentiate the function you obtained and you must get the original integrand back.',
    why: [
      R`If $F'(x)=f(x)$, then $F$ is an antiderivative of $f$. Since the derivative of a constant is zero, a single antiderivative yields infinitely many: $F(x)+C$ is an antiderivative for every choice of the constant, and conversely any two antiderivatives differ only by a constant. That is why we write the $+C$: it is not decoration but the description of the solution set. Giving one concrete $C$ would amount to claiming that only one antiderivative exists.`,
      R`Substitution is not a new trick but the chain rule read backwards. By the chain rule $[F(g(x))]'=F'(g(x))g'(x)=f(g(x))g'(x)$. So if in the integrand we recognise an inner function together with its derivative as a factor, the integral is simply $F(g(x))$. That is why it is crucial to look for the derivative of the inner function instead of memorising the formula.`
    ],
    when: R`The first step of every integration problem: is there an inner function whose derivative (up to a constant factor) is present in the integrand? If so, substitution. If the integrand is a product in which one factor is a logarithm, an inverse trigonometric function or a polynomial, then integration by parts is the way to go. Omitting the $+C$ and losing the constant factor are the two most common ways to drop points at this level.`,
    theory: [
      {
        title: 'Antiderivative and indefinite integral',
        body: R`The function $F$ is an antiderivative of $f$ on an interval if $F'(x)=f(x)$ holds there for every $x$. The notation is $\int f(x)\,dx=F(x)+C$, where $C\in\mathbb R$ is an arbitrary constant. The $dx$ is not a factor but indicates which letter is the variable: $\int f(u)\,du$ is the same function, only with another letter.`
      },
      {
        title: 'Basic integrals',
        note: R`Here $a\neq0$ is a constant. The absolute value in $\ln|x|$ is needed because $1/x$ is also defined on the negative half-line.`
      },
      {
        title: R`Why is the $+C$ there?`,
        body: R`Differentiation is not injective: both $x^2+3$ and $x^2-100$ have derivative $2x$. Hence an antiderivative is determined only up to a constant. The derivative of the difference of two antiderivatives is zero, and on an interval a function with zero derivative is constant. So the full solution set really is $F(x)+C$. For a definite integral the constant cancels, which is why we do not write it out there.`
      },
      {
        title: 'Linear inner function',
        note: 'This is the fastest case: you only have to divide by the derivative of the inner function.'
      },
      {
        title: 'Integration by substitution',
        body: R`If $u=g(x)$ is differentiable and $f$ is continuous, then
\int f(g(x))\,g'(x)\,dx=\int f(u)\,du\Big|_{u=g(x)}=F(g(x))+C,`
      },
      {
        title: 'How do we recognise the pattern?',
        body: R`Look at the integrand and search for an "inner" function. If the derivative of the inner function is present as a factor, substitution is the answer. For example, in $\frac{2x}{x^2+1}$ the inner function is $x^2+1$ with derivative $2x$ — exactly there. In $\cos(3x)$ the inner function is $3x$ with derivative $3$, which can be pulled out as a constant factor. If the derivative differs only by a constant factor, that constant has to be corrected, but a missing $x$ cannot be conjured up.`
      },
      {
        title: 'The most common mistakes',
        body: R`$\int f(x)g(x)\,dx\neq \int f(x)\,dx\cdot\int g(x)\,dx$: the integral does not split over a product. Likewise $\int\frac{1}{x^2+1}\,dx\neq\ln(x^2+1)$: this is not a substitution, the answer is $\arctan$. Also $\int \frac{1}{x}\,dx=\ln|x|$, not $\ln x$, and not $x^{-1}/(-1)$.`
      },
      {
        title: 'Worth keeping in mind',
        items: [
          'Differentiation and integration are inverse operations (up to a constant).',
          'Every integral can be checked by differentiation — worth doing in the exam as well.',
          R`A constant factor can be pulled out: $\int c f(x)\,dx=c\int f(x)\,dx$.`,
          'We integrate sums term by term, but not products.'
        ]
      }
    ],
    examples: [
      {
        title: 'Elementary power integral',
        problem: R`Compute: $\displaystyle\int x^2\,dx$.`,
        steps: [
          R`By the power rule the antiderivative of $x^n$ is $\frac{x^{n+1}}{n+1}$; here $n=2$.`,
          R`$\int x^2\,dx=\frac{x^{3}}{3}+C$.`,
          R`Check: $\left(\frac{x^3}{3}\right)'=\frac{3x^2}{3}=x^2$, so it is correct.`
        ],
        answer: R`$\dfrac{x^3}{3}+C$`
      },
      {
        title: 'Exponential function with a linear inner function',
        problem: R`Compute: $\displaystyle\int e^{3x}\,dx$.`,
        steps: [
          R`The inner function is $3x$, its derivative is $3$.`,
          R`The rule for a linear inner function: $\int e^{ax}dx=\frac{1}{a}e^{ax}+C$.`,
          R`So $\int e^{3x}dx=\frac{1}{3}e^{3x}+C$.`,
          R`Check: $\left(\frac{e^{3x}}{3}\right)'=\frac{3e^{3x}}{3}=e^{3x}$.`
        ],
        answer: R`$\dfrac{e^{3x}}{3}+C$`
      },
      {
        title: 'Logarithmic substitution',
        problem: R`Compute: $\displaystyle\int\frac{2x}{x^2+1}\,dx$.`,
        steps: [
          R`Choose the inner function: $u=x^2+1$, then $du=2x\,dx$.`,
          R`The integrand is exactly of the form $\frac{du}{u}$.`,
          R`$\int\frac{du}{u}=\ln|u|+C=\ln(x^2+1)+C$.`,
          R`Since $x^2+1>0$ for every real $x$, the absolute value can be dropped.`
        ],
        answer: R`$\ln(x^2+1)+C$`
      },
      {
        title: 'Trigonometric function with a linear inner function',
        problem: R`Compute: $\displaystyle\int \sin(5x)\,dx$.`,
        steps: [
          R`The inner function is $5x$, its derivative is $5$.`,
          R`From the formula $\int\sin(ax)dx=-\frac{\cos(ax)}{a}+C$ with $a=5$.`,
          R`$\int\sin(5x)dx=-\frac{\cos(5x)}{5}+C$.`,
          R`Check: $\left(-\frac{\cos(5x)}{5}\right)'=\frac{5\sin(5x)}{5}=\sin(5x)$.`
        ],
        answer: R`$-\dfrac{\cos(5x)}{5}+C$`
      }
    ],
    mistakes: [
      R`Omitting the $+C$ for an indefinite integral.`,
      R`Losing the constant factor: $\int e^{3x}dx=e^{3x}+C$ (correctly $e^{3x}/3$).`,
      R`"Filling in" a missing $x$: thinking of $\ln$ for $\int\frac{1}{x^2+1}dx$ when the answer is $\arctan$.`,
      R`Integrating a product term by term: $\int x\cos x\,dx\neq\frac{x^2}{2}\sin x$.`
    ],
    exercises: [
      { q: R`Compute: $\displaystyle\int x^5\,dx$. (Do not write the $+C$.)`, hint: 'Raise the exponent by one and divide by the new exponent.', sol: R`$\int x^5dx=\frac{x^6}{6}+C$.` },
      { q: R`Compute: $\displaystyle\int\big(3x^2+2\big)\,dx$. (Do not write the $+C$.)`, hint: 'Integrate term by term.', sol: R`$\int 3x^2dx=x^3$, $\int 2dx=2x$, hence $x^3+2x+C$.` },
      { q: R`Compute: $\displaystyle\int \cos(3x)\,dx$. (Do not write the $+C$.)`, hint: R`$\int\cos(ax)dx=\frac{\sin(ax)}{a}+C$.`, sol: R`$a=3$, hence $\frac{\sin(3x)}{3}+C$.` },
      { q: R`Compute: $\displaystyle\int e^{-x}\,dx$. (Do not write the $+C$.)`, hint: R`The inner function is $-x$, its derivative is $-1$.`, sol: R`$\int e^{-x}dx=\frac{e^{-x}}{-1}+C=-e^{-x}+C$.` },
      { q: R`Compute: $\displaystyle\int (2x+1)^5\,dx$. (Do not write the $+C$.)`, hint: 'Linear inner function: divide by the derivative of the inner function.', sol: R`$\frac{1}{2}\cdot\frac{(2x+1)^6}{6}=\frac{(2x+1)^6}{12}+C$.` },
      { q: R`Compute: $\displaystyle\int\frac{dx}{3x+2}$. Give the antiderivative (without $+C$).`, hint: R`$u=3x+2$, $du=3\,dx$, hence $\frac13\int\frac{du}{u}$.`, sol: R`$\frac{1}{3}\ln|3x+2|+C$. The absolute value is needed because $3x+2$ can also be negative.` },
      { q: R`Compute: $\displaystyle\int x\,e^{x^2}\,dx$. (Do not write the $+C$.)`, hint: R`$u=x^2$, then $du=2x\,dx$, hence $x\,dx=\frac{du}{2}$.`, sol: R`$\frac12\int e^u du=\frac{e^{x^2}}{2}+C$. Check: its derivative is $x e^{x^2}$.` },
      { q: R`Prove that if $F$ is an antiderivative of $f$ and $g$ is differentiable, then $\int f(g(x))g'(x)\,dx=F(g(x))+C$.`, hint: R`Read the chain rule backwards: differentiate $F(g(x))$.`, sol: R`By the chain rule $[F(g(x))]'=F'(g(x))\,g'(x)=f(g(x))\,g'(x)$, because $F'=f$. Hence $F(g(x))$ is indeed an antiderivative of the integrand $f(g(x))g'(x)$. Since any two antiderivatives differ by a constant, every solution has the form $F(g(x))+C$.` }
    ],
    video: { title: 'Essence of calculus', channel: '3Blue1Brown' }
  };

  MB.enContent['integralas/integral-parcialis'] = {
    title: 'Integration by parts, rational fractions',
    lead: 'Two techniques that cover most exam problems: integrating a product backwards, and decomposing rational functions into simple fractions.',
    why: [
      R`Integration by parts comes from the product rule. If $(fg)'=f'g+fg'$, then rearranging gives $fg'=(fg)'-f'g$, and integrating gives $\int fg'=fg-\int f'g$. This formula is useful when $\int f'g$ is simpler than the original $\int fg'$. That is why it matters which factor we call $f$: choose as $f$ the one that becomes simpler by differentiation (logarithm, inverse trigonometric function, polynomial), and as $g'$ the one that is easy to integrate (exponential, sine, cosine).`,
      R`Integrating a rational function is not a matter of inspiration but an algorithm. If the degree of the numerator is not smaller than that of the denominator, first perform polynomial division. Then factor the denominator into real factors and write the fraction as a sum of partial fractions. From there every term is either a $\ln$ or an $\arctan$. It always works because polynomials with real coefficients factor into linear and quadratic factors.`
    ],
    when: R`Integration by parts: when the integrand is a product and one factor is "bad" (logarithm, inverse trigonometric function), or when the original integral reappears cyclically ($e^x\sin x$). Rational fractions: when the integrand is a quotient of two polynomials. In the exam the hard part is recognition: $\int\ln x\,dx$ is not a product at first glance, but it is as $1\cdot\ln x$.`,
    theory: [
      {
        title: 'Integration by parts',
        note: R`The integrated form of the product rule. It is often used in the form $\int u\,dv=uv-\int v\,du$.`
      },
      {
        title: 'How should we choose?',
        body: R`Take as $f$ (that is, $u$) the factor that becomes simpler by differentiation: logarithm, inverse trigonometric function, polynomial. Form $g'$ (that is, $dv$) from the factor that is easy to integrate: $e^{ax}$, $\sin(ax)$, $\cos(ax)$, $1$. If you choose badly, the new integral becomes more complicated — then step back and swap the roles.`
      },
      {
        title: 'Repeated and cyclic cases',
        body: R`In a product with a polynomial, the degree of the polynomial drops by one at each step, so after finitely many steps it is gone: $\int x^2e^x dx$ needs two integrations by parts. When computing $\int e^x\sin x\,dx$, the original integral reappears after integration by parts; then solve the resulting equation for it. In such cases the constant is added at the very end.`
      },
      {
        title: 'Proper rational function',
        body: R`The rational function $\frac{P(x)}{Q(x)}$ is proper if $\deg P<\deg Q$. If it is not, write $P=Q\cdot S+T$ by polynomial division, so $\frac PQ=S+\frac TQ$, where $\frac TQ$ is proper. The polynomial $S$ can be integrated term by term, so the hard part is always the proper fraction.`
      },
      {
        title: 'Partial fraction decomposition',
        body: R`If $Q$ has distinct real roots $\alpha_1,\dots,\alpha_k$, then $\dfrac{P}{Q}=\sum_{i}\dfrac{A_i}{x-\alpha_i}$. For a repeated factor $(x-\alpha)^m$ the terms $\sum_{j=1}^{m}\dfrac{B_j}{(x-\alpha)^j}$ appear. For an irreducible factor $(x^2+px+q)$ the numerator is linear: $\dfrac{Cx+D}{x^2+px+q}$.`
      },
      {
        title: 'The two closing integrals',
        note: R`The second one comes from the decomposition $\frac{1}{x^2-a^2}=\frac{1}{2a}\left(\frac{1}{x-a}-\frac{1}{x+a}\right)$.`
      },
      {
        title: 'Checking is always possible',
        body: R`You do not have to take the partial fraction decomposition on faith: bringing it to a common denominator must give back the original numerator. For an irreducible quadratic factor the numerator cannot be constant if $x^2$ appears in the denominator — this mistake is hard to spot, so multiplying back is the best protection.`
      },
      {
        title: 'Which method when?',
        items: [
          'Polynomial × exponential or polynomial × trigonometric: integration by parts, differentiating the polynomial.',
          'A logarithm or an inverse trigonometric function alone: integration by parts with $dv=dx$.',
          'A quotient of two polynomials: partial fractions (polynomial division first).',
          'A product where the derivative of the inner function is present: substitution, not integration by parts.'
        ]
      }
    ],
    examples: [
      {
        title: 'Polynomial times exponential',
        problem: R`Compute: $\displaystyle\int x\,e^x\,dx$.`,
        steps: [
          R`Choose $f=x$ and $g'=e^x$, because the polynomial becomes simpler by differentiation.`,
          R`Then $f'=1$ and $g=e^x$.`,
          R`The formula: $\int xe^xdx=xe^x-\int 1\cdot e^xdx=xe^x-e^x+C$.`,
          R`Factoring out: $(x-1)e^x+C$. Check: $(xe^x-e^x)'=e^x+xe^x-e^x=xe^x$.`
        ],
        answer: R`$(x-1)e^x+C$`
      },
      {
        title: 'The integral of the logarithm',
        problem: R`Compute: $\displaystyle\int \ln x\,dx$.`,
        steps: [
          R`Write it as a product: $\ln x=\ln x\cdot 1$. Let $f=\ln x$, $g'=1$.`,
          R`Then $f'=\frac1x$ and $g=x$.`,
          R`$\int\ln x\,dx=x\ln x-\int x\cdot\frac1x\,dx=x\ln x-\int 1\,dx$.`,
          R`So $x\ln x-x+C=x(\ln x-1)+C$, defined for $x>0$.`
        ],
        answer: R`$x\ln x-x+C$`
      },
      {
        title: 'Simple partial fractions',
        problem: R`Compute: $\displaystyle\int\frac{dx}{x^2-1}$.`,
        steps: [
          R`The denominator factors: $x^2-1=(x-1)(x+1)$.`,
          R`We seek the decomposition $\frac{1}{(x-1)(x+1)}=\frac{A}{x-1}+\frac{B}{x+1}$.`,
          R`After bringing to a common denominator $1=A(x+1)+B(x-1)$. At $x=1$ we get $1=2A$, so $A=\frac12$; at $x=-1$ we get $1=-2B$, so $B=-\frac12$.`,
          R`Hence $\int\left(\frac{1/2}{x-1}-\frac{1/2}{x+1}\right)dx=\frac12\ln|x-1|-\frac12\ln|x+1|+C$.`,
          R`Combining: $\frac12\ln\left|\frac{x-1}{x+1}\right|+C$.`
        ],
        answer: R`$\dfrac12\ln\left|\dfrac{x-1}{x+1}\right|+C$`
      },
      {
        title: 'Decomposing a rational fraction',
        problem: R`Compute: $\displaystyle\int\frac{x+1}{x^2-3x+2}\,dx$.`,
        steps: [
          R`The denominator: $x^2-3x+2=(x-1)(x-2)$. The degree of the numerator is smaller, so the fraction is proper.`,
          R`$\frac{x+1}{(x-1)(x-2)}=\frac{A}{x-1}+\frac{B}{x-2}$, that is $x+1=A(x-2)+B(x-1)$.`,
          R`At $x=1$ we get $2=-A$, so $A=-2$; at $x=2$ we get $3=B$, so $B=3$.`,
          R`The integral: $-2\ln|x-1|+3\ln|x-2|+C$.`,
          R`Check by differentiation: $-\frac{2}{x-1}+\frac{3}{x-2}=\frac{-2(x-2)+3(x-1)}{(x-1)(x-2)}=\frac{x+1}{x^2-3x+2}$.`
        ],
        answer: R`$3\ln|x-2|-2\ln|x-1|+C$`
      }
    ],
    mistakes: [
      R`Choosing the wrong $u$: taking $u=x$ instead of the logarithm in $\int x\ln x\,dx$ — this produces a harder integral.`,
      R`Dropping the minus sign in integration by parts: $\int fg'=fg-\int f'g$, not $fg+\int f'g$.`,
      R`Forgetting polynomial division for an improper fraction: trying to decompose $\frac{x^2}{x+1}$ directly.`,
      R`Writing a constant numerator instead of $Cx+D$ for an irreducible quadratic factor.`
    ],
    exercises: [
      { q: R`Compute: $\displaystyle\int x\cos x\,dx$. (Do not write the $+C$.)`, hint: R`$f=x$, $g'=\cos x$; the polynomial disappears by differentiation.`, sol: R`$x\sin x-\int\sin x\,dx=x\sin x+\cos x+C$.` },
      { q: R`Compute: $\displaystyle\int x\ln x\,dx$ ($x>0$). (Do not write the $+C$.)`, hint: R`$f=\ln x$, $g'=x$.`, sol: R`$\frac{x^2}{2}\ln x-\int\frac{x^2}{2}\cdot\frac1x dx=\frac{x^2}{2}\ln x-\frac{x^2}{4}+C$.` },
      { q: R`Compute: $\displaystyle\int\frac{dx}{x^2+9}$. Give the antiderivative.`, hint: R`$a=3$: $\int\frac{dx}{x^2+a^2}=\frac1a\arctan\frac xa$.`, sol: R`$\frac13\arctan\frac{x}{3}+C$. Check: its derivative is $\frac13\cdot\frac{1/3}{1+(x/3)^2}=\frac{1}{x^2+9}$.` },
      { q: R`Compute: $\displaystyle\int x^2e^x\,dx$. (Do not write the $+C$.)`, hint: 'Integrate by parts twice, always differentiating the polynomial.', sol: R`First $x^2e^x-2\int xe^xdx$, then $\int xe^xdx=(x-1)e^x$, so $x^2e^x-2(x-1)e^x=(x^2-2x+2)e^x+C$.` },
      { q: R`Compute: $\displaystyle\int\frac{2x+3}{x^2+3x+2}\,dx$. Give the antiderivative.`, hint: R`The denominator is $(x+1)(x+2)$; the decomposition is $\frac{1}{x+1}+\frac{1}{x+2}$.`, sol: R`$\frac{2x+3}{(x+1)(x+2)}=\frac{1}{x+1}+\frac{1}{x+2}$, so $\ln|x+1|+\ln|x+2|+C=\ln|x^2+3x+2|+C$.` },
      { q: R`Compute: $\displaystyle\int e^x\sin x\,dx$. (Do not write the $+C$.)`, hint: 'After integrating by parts twice the original integral reappears; solve for it.', sol: R`After two integrations by parts $I=e^x\sin x-e^x\cos x-I$, so $2I=e^x(\sin x-\cos x)$, i.e. $I=\frac{e^x(\sin x-\cos x)}{2}+C$.` },
      { q: R`Compute: $\displaystyle\int\frac{dx}{x^2-4}$. Give the antiderivative.`, hint: R`$a=2$, and $x^2-4=(x-2)(x+2)$.`, sol: R`$\frac{1}{x^2-4}=\frac14\left(\frac{1}{x-2}-\frac{1}{x+2}\right)$, so $\frac14\ln\left|\frac{x-2}{x+2}\right|+C$.` },
      { q: R`Derive the integration by parts formula from the product rule.`, hint: R`Start from $(fg)'=f'g+fg'$ and integrate both sides.`, sol: R`The product rule: $(fg)'=f'g+fg'$. Integrating both sides gives $fg=\int f'g\,dx+\int fg'\,dx$ (the constant is written at the end). Rearranging, $\int fg'\,dx=fg-\int f'g\,dx$, which is exactly the integration by parts formula.` }
    ],
    video: { title: 'Essence of calculus', channel: '3Blue1Brown' }
  };

  MB.enContent['integralas/integral-hatarozott'] = {
    title: 'Definite integral, area, volume, improper integrals',
    lead: 'The definite integral is a number: a signed area. From this come area computations, the volume of a solid of revolution and the handling of regions stretching to infinity — all three rest on the same limit idea.',
    why: [
      R`The definite integral is defined by approximating area: we subdivide $[a,b]$, approximate on each piece by a rectangle, and refine the subdivision. The limit of the partial sums is the integral. From this definition it is immediately clear that the integral is a signed area: the part below the axis counts with a negative sign. That is why whenever the word "area" is used one must always check where the function lies relative to the axis.`,
      R`The Newton–Leibniz theorem is what makes the definition usable: it says $\int_a^b f=F(b)-F(a)$ for any antiderivative. No rectangles have to be summed, one antiderivative is enough. This relation also shows why area and antiderivative are the same thing: the accumulation function $A(x)=\int_a^xf$ has derivative $f(x)$.`
    ],
    when: R`For area computations (also between two curves), volumes of solids of revolution, in probability theory (density function), in physics (work, distance) and for improper integrals. Typical exam mistakes: ignoring the sign of the area, integrating across a discontinuity, and "substituting" the infinite limit.`,
    theory: [
      {
        title: 'Definite integral',
        body: R`The definite integral of $f$ over $[a,b]$, $\int_a^b f(x)\,dx$, is the limit of the approximating sums as the fineness of the subdivision tends to zero. Intuitively it is the signed area between the graph of $f$ and the $x$-axis, where the part below the axis is negative.`
      },
      {
        title: 'Newton–Leibniz theorem',
        body: R`If $f$ is continuous on $[a,b]$ and $F$ is an antiderivative of it, then
\int_a^b f(x)\,dx=F(b)-F(a).`,
        note: R`The constant cancels, which is why no $+C$ is needed for a definite integral.`
      },
      {
        title: 'Properties',
        note: 'The second property (splitting the interval) is vital when the function changes sign or is discontinuous inside the interval.'
      },
      {
        title: 'Area between two curves',
        note: R`If the two curves intersect several times inside the interval under study, the integral must be split at the intersection points and the upper function determined piecewise. Steps: sketch the curves and find the intersection points; decide which function is on top on which interval; integrate the difference; for an area the result is non-negative, so if you got a negative number you probably swapped the order.`
      },
      {
        title: 'Volume of a solid of revolution'
      },
      {
        title: 'Improper integral',
        body: R`On an infinite interval: $\int_a^\infty f=\lim_{b\to\infty}\int_a^b f$, if the limit exists and is finite; then the integral is convergent. In case of a discontinuity: if $f$ is not continuous at $a$, then $\int_a^b f=\lim_{c\to a+}\int_c^b f$. If the limit does not exist or is infinite, the integral is divergent.`
      },
      {
        title: R`The $p$-integral`,
        body: R`\int_1^\infty\frac{dx}{x^p}\ \text{convergent}\iff p>1,\qquad \int_0^1\frac{dx}{x^p}\ \text{convergent}\iff p<1.`,
        note: R`In the convergent case $\int_1^\infty x^{-p}dx=\frac{1}{p-1}$, and $\int_0^1x^{-p}dx=\frac{1}{1-p}$. The case $p=1$ is the borderline in both: $\int_1^\infty \frac{dx}{x}$ and $\int_0^1\frac{dx}{x}$ are both divergent.`
      },
      {
        title: 'Why is "substituting infinity" not allowed?',
        body: R`For $\int_1^\infty x^{-2}dx$ the correct route is $\lim_{b\to\infty}\left[-\frac1x\right]_1^b=\lim_{b\to\infty}\left(1-\frac1b\right)=1$. The symbol $\infty$ is not a number, so $\left[-\frac1x\right]_1^\infty$ on its own is meaningless notation. Likewise, if the integrand is discontinuous inside the interval, the integral must be split at the discontinuity, otherwise the result is wrong.`
      }
    ],
    examples: [
      {
        title: 'Basic integral with Newton–Leibniz',
        problem: R`Compute: $\displaystyle\int_0^{\pi}\sin x\,dx$.`,
        steps: [
          R`An antiderivative: $-\cos x$.`,
          R`Newton–Leibniz: $\big[-\cos x\big]_0^{\pi}=-\cos\pi-(-\cos 0)$.`,
          R`$\cos\pi=-1$, $\cos 0=1$, so $1+1=2$.`,
          R`Intuitively: the area under the graph of $\sin$ over $[0,\pi]$ is indeed 2.`
        ],
        answer: R`$2$`
      },
      {
        title: 'Area between two curves',
        problem: R`Find the area between the parabola $y=x^2$ and the line $y=x$.`,
        steps: [
          R`Intersection points: $x^2=x$, that is $x(x-1)=0$, so $x=0$ and $x=1$.`,
          R`On $[0,1]$ we have $x\ge x^2$, because for example at $x=\frac12$, $\frac12>\frac14$.`,
          R`The area: $\int_0^1(x-x^2)\,dx=\left[\frac{x^2}{2}-\frac{x^3}{3}\right]_0^1$.`,
          R`Substituting: $\frac12-\frac13=\frac16$.`
        ],
        answer: R`$\dfrac16$`
      },
      {
        title: 'Volume of a solid of revolution',
        problem: R`Rotate the curve $y=x^2$ about the $x$-axis over the interval $[0,1]$. What is the volume of the resulting solid?`,
        steps: [
          R`The radius of the slice produced by the rotation is $f(x)=x^2$, so the volume element is $\pi f(x)^2dx$.`,
          R`$V=\pi\int_0^1 (x^2)^2\,dx=\pi\int_0^1 x^4\,dx$.`,
          R`$\int_0^1 x^4dx=\left[\frac{x^5}{5}\right]_0^1=\frac15$.`,
          R`So $V=\frac{\pi}{5}$.`
        ],
        answer: R`$V=\dfrac{\pi}{5}$`
      },
      {
        title: 'Computing an improper integral',
        problem: R`Compute: $\displaystyle\int_1^\infty\frac{dx}{x^2}$.`,
        steps: [
          R`By definition: $\lim_{b\to\infty}\int_1^b x^{-2}\,dx$.`,
          R`An antiderivative: $-x^{-1}=-\frac1x$.`,
          R`$\int_1^b x^{-2}dx=\left[-\frac1x\right]_1^b=-\frac1b+1$.`,
          R`Limit: $\lim_{b\to\infty}\left(1-\frac1b\right)=1$, so the integral is convergent with value 1.`
        ],
        answer: R`$1$`
      }
    ],
    mistakes: [
      R`Taking the area below the axis with a negative sign and reporting a negative area; for an area you need an absolute value or a split interval.`,
      R`Substituting the infinite limit directly into the antiderivative, without taking a limit.`,
      R`Integrating across a discontinuity: $\int_{-1}^1\frac{dx}{x^2}$ is not $[-1/x]_{-1}^1=-2$, because the integrand is not continuous at 0.`,
      R`Forgetting to square the radius for a solid of revolution: using $V=\pi\int f\,dx$ instead of $V=\pi\int f^2dx$.`
    ],
    exercises: [
      { q: R`Compute: $\displaystyle\int_0^1 x^2\,dx$.`, hint: R`An antiderivative: $x^3/3$.`, sol: R`$\left[\frac{x^3}{3}\right]_0^1=\frac13$.` },
      { q: R`Compute: $\displaystyle\int_0^{\pi/2}\cos x\,dx$.`, hint: R`An antiderivative of $\cos$ is $\sin$.`, sol: R`$\big[\sin x\big]_0^{\pi/2}=\sin\frac{\pi}{2}-\sin0=1$.` },
      { q: R`Compute: $\displaystyle\int_{-1}^{1}x^3\,dx$.`, hint: 'An odd function on a symmetric interval.', sol: R`$\left[\frac{x^4}{4}\right]_{-1}^1=\frac14-\frac14=0$. An odd integrand on a symmetric interval: the signed areas cancel each other.` },
      { q: R`What is the area between the curves $y=x^2$ and $y=x$?`, hint: R`Intersection points: $x=0$ and $x=1$.`, sol: R`$\int_0^1(x-x^2)dx=\frac12-\frac13=\frac16$.` },
      { q: R`The curve $y=\sqrt{x}$ is rotated about the $x$-axis over the interval $[0,1]$. What is the volume?`, hint: R`$V=\pi\int_0^1(\sqrt x)^2dx=\pi\int_0^1 x\,dx$.`, sol: R`$V=\pi\left[\frac{x^2}{2}\right]_0^1=\frac{\pi}{2}$.` },
      { q: R`Compute: $\displaystyle\int_0^\infty e^{-x}\,dx$.`, hint: R`$\lim_{b\to\infty}\big[-e^{-x}\big]_0^b$.`, sol: R`$\int_0^b e^{-x}dx=1-e^{-b}\to1$, so the integral is convergent with value 1.` },
      { q: R`Convergent or divergent: $\displaystyle\int_1^\infty\frac{dx}{x}$?`, choices: ['Convergent', 'Divergent'], sol: R`$\int_1^b\frac{dx}{x}=\ln b\to\infty$, so it is divergent. This is the borderline case $p=1$.` },
      { q: R`Prove that $\displaystyle\int_0^1 x^{-p}\,dx$ is convergent exactly when $p<1$.`, hint: R`Treat the cases $p=1$ and $p\neq1$ separately, and compute the limit $\lim_{c\to0+}\int_c^1x^{-p}dx$.`, sol: R`If $p\neq1$: $\int_c^1x^{-p}dx=\left[\frac{x^{1-p}}{1-p}\right]_c^1=\frac{1}{1-p}-\frac{c^{1-p}}{1-p}$. If $p<1$, then $1-p>0$, so $c^{1-p}\to0$ and the limit $\frac{1}{1-p}$ is finite: convergent. If $p>1$, then $1-p<0$, so $c^{1-p}\to\infty$: divergent. If $p=1$: $\int_c^1\frac{dx}{x}=-\ln c\to\infty$: divergent. Hence it is convergent exactly when $p<1$.` }
    ],
    video: { title: 'Essence of calculus', channel: '3Blue1Brown' }
  };
})();
