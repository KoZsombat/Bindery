(function () {
  const MB = window.MB;
  MB.enContent = MB.enContent || {};
  const R = String.raw;

  MB.enContent['hatarertek/fuggveny-hatarertek'] = {
    title: 'Limits and continuity',
    summary: 'The ε–δ definition, one-sided limits, the sequential criterion, continuity, the types of discontinuity and the squeeze theorem.',
    lead: R`The indisputably university-level part: $$\lim_{x\to a}f(x)=L.$$ The definition is a bargain between two players — you give an $\varepsilon$, the function gives a $\delta$. The routine (multiplying out, factoring, the squeeze theorem) comes only afterwards, and continuity is nothing other than the limit and the function value coinciding.`,
    why: [
      R`The behaviour of a function at a point splits into two separate questions: what is the value $f(a)$, and what does $f(x)$ tend to as $x\to a$. In the definition of the derivative, for instance, $h=0$ cannot be substituted into the difference quotient, only the limit $h\to0$ can be taken — so the existence of the derivative is a purely limit-theoretic question. Likewise continuity, asymptotes and later the improper integral are defined by limits, not "by looking at the graph".`,
      R`The $\varepsilon$–$\delta$ definition is not pointless formalism: it pins down exactly what "gets arbitrarily close" means, and this is the formulation used in every proof. In practice two things must be learned: (1) how to construct $\delta$ for a given $\varepsilon$ from the definition (in the linear case $\delta=\varepsilon/|m|$), and (2) how to refute the definition — for that it is enough to exhibit two sequences tending to the same point whose function values tend to different limits.`
    ],
    when: R`The first big topic of ZH1. Reach for it when: you have to compute the limit of a fraction in $0/0$ form; you have to give the fitting parameter of a piecewise-defined function; you have to decide continuity or the type of a discontinuity; or you have to prove a statement in $\varepsilon$–$\delta$ style. Every later chapter (derivative, integral, series) is written in this language.`,
    theory: [
      { title: 'Limit (ε–δ)', body: R`Let $f$ be defined in some neighbourhood of the point $a$ (possibly not at $a$ itself). We say that $\lim_{x\to a}f(x)=L$ if for every $\varepsilon>0$ there exists a $\delta>0$ such that
$$0<|x-a|<\delta \ \Longrightarrow\ |f(x)-L|<\varepsilon.$$
The condition $0<$ means that the point $a$ itself is excluded: the limit does not depend on whether $f(a)$ exists, nor on its value if it does.` },
      { title: 'How to read the definition', body: R`Two players: the challenger names an error bound $\varepsilon$ ("get closer than this"), and we answer with a $\delta$ ("if you come closer than this, it holds"). The order is fixed: $\delta$ may depend on $\varepsilon$, but $\varepsilon$ must not depend on $\delta$. The definition is true if for every $\varepsilon$ there is a good $\delta$ — a single counterexample $\varepsilon$ refutes the statement.` },
      { title: 'One-sided limit', body: R`$\lim_{x\to a^-}f(x)=L$ (left-hand limit) if only the points $x<a$ are considered; $\lim_{x\to a^+}f(x)=L$ (right-hand limit) if only the points $x>a$. The two-sided limit exists and equals $L$ exactly when both one-sided limits exist and both equal $L$.` },
      { title: 'Sequential criterion (transfer principle)', body: R`$\lim_{x\to a}f(x)=L$ exactly when for every sequence $(x_n)$ with $x_n\to a$ and $x_n\neq a$, we have $f(x_n)\to L$.
Its refuting direction is the most frequently used tool: if we find two sequences with $x_n\to a$ and $y_n\to a$ such that $f(x_n)\to L_1$, $f(y_n)\to L_2$ and $L_1\neq L_2$, then the limit does not exist.` },
      { title: 'Continuity', body: R`$f$ is continuous at the point $a$ if $f$ is defined at $a$, the limit exists, and
$$\lim_{x\to a}f(x)=f(a).$$
This is three conditions together: $f(a)$ exists, the limit exists, and the two are equal. It is continuous on an interval if it is continuous at every interior point of the interval; on a closed interval we also require the appropriate one-sided continuity at the endpoints.` },
      { title: 'Types of discontinuity', items: [
        R`Removable: the limit exists and is finite, but $f(a)$ does not exist or is not equal to it. Example: $\frac{x^2-4}{x-2}$ at $x=2$ (limit $4$).`,
        R`Jump: both one-sided limits are finite but different. Example: $\frac{x}{|x|}$ at $x=0$ ($-1$ and $+1$).`,
        R`Infinite (pole): one of the one-sided limits is $\pm\infty$. Example: $\frac{1}{x^2}$ at $x=0$.`,
        R`Essential (oscillating): not even the one-sided limits exist. Example: $\sin\frac1x$ at $x=0$.`
      ] },
      { title: 'Squeeze theorem (sandwich theorem)', body: R`If $g(x)\le f(x)\le h(x)$ in a neighbourhood of $a$ and $\lim_{x\to a}g(x)=\lim_{x\to a}h(x)=L$, then $\lim_{x\to a}f(x)=L$ holds as well. This is how oscillating factors are handled: $x\sin\frac1x\to0$, because $-|x|\le x\sin\frac1x\le|x|$. Operations: the limits of sums, products, quotients (with nonzero denominator) and composite functions can all be computed from the limits.` },
      { title: 'The $0/0$ is not an answer', body: R`If substitution gives the form $\frac00$, that does not mean the limit does not exist; it means the function is "punctured" at that point and an algebraic manipulation is needed. The $\frac00$ only says that both numerator and denominator vanish — the limit of the quotient may be $0$, a finite nonzero number, $\pm\infty$, or nonexistent. Never write "$=0/0$", because that is not a number. The continuity of the trigonometric functions, on the other hand, comes for free: $\lim_{x\to0}\sin x=0$ and $\lim_{x\to0}\cos x=1$.` }
    ],
    examples: [
      {
        title: '0/0 form by factoring',
        problem: R`Compute: $\displaystyle\lim_{x\to2}\frac{x^2-4}{x^2-2x}$.`,
        steps: [
          R`Substitute: $\frac{4-4}{4-4}=\frac00$, so a manipulation is needed.`,
          R`Numerator: $x^2-4=(x-2)(x+2)$; denominator: $x^2-2x=x(x-2)$.`,
          R`Cancel the common factor $(x-2)$, which is allowed for $x\neq2$: $\frac{(x-2)(x+2)}{x(x-2)}=\frac{x+2}{x}$.`,
          R`Now substitution works: $\frac{2+2}{2}=2$.`
        ],
        answer: R`$2$`
      },
      {
        title: 'Factoring a quadratic',
        problem: R`Compute: $\displaystyle\lim_{x\to3}\frac{x^2-5x+6}{x-3}$.`,
        steps: [
          R`Substitute: $\frac{9-15+6}{0}=\frac00$.`,
          R`The roots of the numerator are $2$ and $3$ (Viète: sum $5$, product $6$), hence $x^2-5x+6=(x-2)(x-3)$.`,
          R`Cancel: $\frac{(x-2)(x-3)}{x-3}=x-2$ ($x\neq3$).`,
          R`Limit: $3-2=1$.`
        ],
        answer: R`$1$`
      },
      {
        title: 'Squeeze theorem with an oscillating factor',
        problem: R`Show that $\displaystyle\lim_{x\to0}x\sin\frac1x=0$.`,
        steps: [
          R`Near $x=0$ the factor $\sin\frac1x$ changes sign infinitely often and has no limit — but it is bounded: $\left|\sin\frac1x\right|\le1$.`,
          R`Therefore $0\le\left|x\sin\frac1x\right|\le|x|$.`,
          R`$|x|\to0$ as $x\to0$, so by the squeeze theorem the trapped expression also tends to $0$.`,
          R`Conclusion: the limit of the product is $0$, even though one factor has no limit.`
        ],
        answer: R`$0$`
      },
      {
        title: 'Classifying a discontinuity',
        problem: R`Analyse the function $f(x)=\dfrac{x^2-1}{x-1}$ ($x\neq1$), $f(1)=3$ at the point $x=1$.`,
        steps: [
          R`The limit: $\frac{x^2-1}{x-1}=\frac{(x-1)(x+1)}{x-1}=x+1\to2$.`,
          R`The function value: $f(1)=3$.`,
          R`The limit exists and is finite ($2$), but it does not equal $f(1)$, so the function is not continuous at $x=1$.`,
          R`The discontinuity is removable: redefining $f(1)=2$ makes the function continuous. (Looking only at the limit, we see a "hole" type discontinuity.)`
        ],
        answer: R`Removable discontinuity; the continuous extension has the value $f(1)=2$.`
      }
    ],
    mistakes: [
      R`After substituting we write $\frac00$ as the answer and do not manipulate any further.`,
      R`We believe that for a limit to exist, $f(a)$ must exist. For example $\frac{\sin x}{x}$ has no value at $x=0$, yet its limit is $1$.`,
      R`We add or "average" the two one-sided limits — if they differ, the two-sided limit does not exist.`,
      R`We cancel in a case where it is not allowed: $\frac{x^2-4}{x-2}=x+2$ only for $x\neq2$, and that is exactly why the limit can be taken.`
    ],
    exercises: [
      { q: R`Compute: $\displaystyle\lim_{x\to3}\frac{x^2-9}{x-3}$.`, hint: R`$x^2-9=(x-3)(x+3)$.`, sol: R`$\frac{(x-3)(x+3)}{x-3}=x+3\to6$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to0}\frac{\sqrt{1+x}-1}{x}$.`, hint: R`Multiply the fraction by $\sqrt{1+x}+1$ (the conjugate).`, sol: R`$\frac{(1+x)-1}{x(\sqrt{1+x}+1)}=\frac{1}{\sqrt{1+x}+1}\to\frac12$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to1}\frac{x^3-1}{x-1}$.`, hint: R`$x^3-1=(x-1)(x^2+x+1)$.`, sol: R`After cancelling, $x^2+x+1\to3$.` },
      { q: R`Let $f(x)=x+1$ for $x<0$ and $f(x)=x^2+2$ for $x\ge0$. Does $\lim_{x\to0}f(x)$ exist?`, choices: ['Yes, its value is 1', 'Yes, its value is 2', 'No, because the one-sided limits differ', 'No, because $f$ is not continuous'], sol: R`From the left $x+1\to1$, from the right $x^2+2\to2$. The two one-sided limits differ, so the two-sided limit does not exist.` },
      { q: R`Compute: $\displaystyle\lim_{x\to0}x^2\sin\frac1x$.`, hint: R`Squeeze theorem: $0\le|x^2\sin(1/x)|\le x^2$.`, sol: R`The sine is bounded, so $|x^2\sin(1/x)|\le x^2\to0$, hence the limit is $0$.` },
      { q: R`For which value of $k$ does $f(x)=\dfrac{x^2-9}{x-3}$ ($x\neq3$), $f(3)=k$ become continuous at the point $x=3$?`, hint: R`For continuity, $k$ must equal the limit.`, sol: R`$\frac{x^2-9}{x-3}=x+3\to6$, so we need $k=6$.` },
      { q: R`Prove from the definition that $\displaystyle\lim_{x\to2}(3x-1)=5$.`, hint: R`For a given $\varepsilon$ choose $\delta=\varepsilon/3$ and estimate $|(3x-1)-5|$.`, sol: R`$|(3x-1)-5|=|3x-6|=3|x-2|$. For a given $\varepsilon>0$ let $\delta=\varepsilon/3$. Then for $0<|x-2|<\delta$ we have $|f(x)-5|=3|x-2|<3\delta=\varepsilon$, so the definition holds.` },
      { q: R`Compute: $\displaystyle\lim_{x\to0}\frac{1-\cos x}{x^2}$.`, hint: R`Use the identity $1-\cos x=2\sin^2\frac x2$.`, sol: R`$\frac{2\sin^2(x/2)}{x^2}=2\left(\frac{\sin(x/2)}{x}\right)^2=\frac12\left(\frac{\sin(x/2)}{x/2}\right)^2\to\frac12$.` }
    ],
    video: { title: 'Limits and continuity of functions', channel: 'Hungarian mathematics channels' }
  };

  MB.enContent['hatarertek/fuggveny-nevezetes'] = {
    title: 'Notable limits, asymptotes',
    summary: "Standard limits, vertical, horizontal and slanted asymptotes, and a first look at L'Hôpital's rule.",
    lead: R`A few limits occur so often that they are worth knowing as a stock: $\frac{\sin x}{x}$, $\frac{e^x-1}{x}$, $\frac{\ln(1+x)}{x}$, $\left(1+\frac ax\right)^x$. The same limits describe the behaviour of a function at infinity and at its poles — that is, the asymptotes.`,
    why: [
      R`The limit $\frac{\sin x}{x}\to1$ is no curiosity: the derivative $(\sin x)'=\cos x$ comes from it, and through that all trigonometric derivatives and integrals. Similarly, the limit $\frac{e^x-1}{x}\to1$ gives the property $(e^x)'=e^x$, and $\frac{\ln(1+x)}{x}\to1$ gives the formula $(\ln x)'=1/x$. Anyone who understands these limits does not memorise the derivative table but can derive it.`,
      R`The limit $\left(1+\frac ax\right)^x\to e^a$ is the model of continuous compound interest and the natural definition of the number $e$. Asymptotes carry the same idea further: the limit at infinity tells whether the function flattens onto a horizontal line or follows a slanted line. The parameters $m$ and $b$ of the slanted asymptote are no magic, but exactly the two limits supplied by the definitions of this chapter.`
    ],
    when: R`When computing limits if a trigonometric, exponential or logarithmic expression stands in $0/0$ form; in curve sketching at the ends of the domain and at the poles; in deriving derivatives; and in every problem whose question is "what is the limit at infinity". In the ZH there are typically 2–3 short computations and one asymptote problem from this circle.`,
    theory: [
      { title: 'Notable limits', note: R`In the rewriting $\left(1+\frac ax\right)^x=\left[\left(1+\frac ax\right)^{x/a}\right]^a$, the substitution $u=\frac xa$ makes the inner bracket tend to $e$, so the limit is $e^a$ (also for negative $a$). The same rewriting yields the identity $a^x=e^{x\ln a}$.` },
      { title: 'Where does sin x/x → 1 come from?', body: R`On the range $0<x<\frac\pi2$, comparing areas gives $\sin x<x<\tan x$, whence $\cos x<\frac{\sin x}{x}<1$. Since $\cos x\to1$, the squeeze theorem gives that the quotient tends to $1$ as well. This proof is crucial: the trigonometric part of the derivative table rests on it, so it cannot be proved later with L'Hôpital — that would be circular reasoning.` },
      { title: 'Vertical asymptote', body: R`The line $x=a$ is a vertical asymptote if $\lim_{x\to a^-}f(x)=\pm\infty$ or $\lim_{x\to a^+}f(x)=\pm\infty$ (the signs on the two sides may differ). For a fraction, look where the denominator is zero but the numerator is not — if both are zero, cancel first.` },
      { title: 'Horizontal and slanted asymptote', body: R`The line $y=c$ is a horizontal asymptote if $\lim_{x\to\infty}f(x)=c$ or $\lim_{x\to-\infty}f(x)=c$. The parameters of the slanted asymptote $y=mx+b$ are:
$$m=\lim_{x\to\infty}\frac{f(x)}{x},\qquad b=\lim_{x\to\infty}\bigl(f(x)-mx\bigr),$$
provided both limits are finite. The horizontal asymptote is the case $m=0$ of this, so the two can be handled together.` },
      { title: "L'Hôpital preliminary", body: R`The rule: if $\frac{f(x)}{g(x)}$ has the form $0/0$ or $\infty/\infty$ and the quotient of the derivatives has a limit, then $\lim\frac fg=\lim\frac{f'}{g'}$. Two warnings. (1) It may be used only for the two indeterminate forms; not for $\frac{2}{0}$. (2) It does not prove the limit $\frac{\sin x}{x}$, because the formula $(\sin x)'=\cos x$ follows precisely from this limit. For computation it is convenient, however, and we return to it in detail in 6.4.` },
      { title: 'Quick overview: what and how', items: [
        R`$\frac{\sin(ax)}{x}\to a$, because $\frac{\sin(ax)}{ax}\cdot a\to1\cdot a$.`,
        R`$\frac{e^{ax}-1}{x}\to a$, because $\frac{e^{ax}-1}{ax}\cdot a\to a$.`,
        R`$\frac{\ln(1+ax)}{x}\to a$, because $\frac{\ln(1+ax)}{ax}\cdot a\to a$.`,
        R`$\left(1+\frac ax\right)^{bx}\to e^{ab}$, because it is the $b$-th power of the earlier limit.`
      ] },
      { title: 'The trap of the power form', body: R`The form $1^\infty$ is indeterminate! In $\left(1+\frac1x\right)^x$ with $x\to\infty$ the base tends to $1$ and the exponent to $\infty$, yet the limit is not $1$ but $e$. Never substitute the limits of the parts separately when the result would be $1^\infty$, $0^0$ or $\infty^0$.` },
      { title: 'Asymptote by polynomial division', body: R`If the degree of the numerator is exactly one higher than that of the denominator, the slanted asymptote is the polynomial part of the division. For example $\frac{2x^2+1}{x-1}=2x+2+\frac{3}{x-1}$, so the slanted asymptote is $y=2x+2$; the remainder shows from which side the function approaches the line. As for orders of magnitude, $\ln x\ll x^k\ll e^x$, hence $\frac{\ln x}{x}\to0$.` }
    ],
    examples: [
      {
        title: 'sin(5x)/x',
        problem: R`Compute: $\displaystyle\lim_{x\to0}\frac{\sin 5x}{x}$.`,
        steps: [
          R`The basic limit is $\frac{\sin u}{u}\to1$.`,
          R`Multiply by $5$: $\frac{\sin5x}{x}=5\cdot\frac{\sin5x}{5x}$.`,
          R`With the substitution $u=5x$ we have $u\to0$, so the second factor tends to $1$.`,
          R`Limit: $5\cdot1=5$.`
        ],
        answer: R`$5$`
      },
      {
        title: 'Second-order term from an exponential',
        problem: R`Compute: $\displaystyle\lim_{x\to0}\frac{e^x-1-x}{x^2}$.`,
        steps: [
          R`Substitute: $\frac{1-1-0}{0}=\frac00$.`,
          R`L'Hôpital once: $\frac{e^x-1}{2x}$, which is still $\frac00$.`,
          R`L'Hôpital a second time: $\frac{e^x}{2}$.`,
          R`Substitute: $\frac{1}{2}$, so the limit is $\frac12$. (With a Taylor series the same: $e^x=1+x+\frac{x^2}{2}+o(x^2)$.)`
        ],
        answer: R`$\dfrac12$`
      },
      {
        title: 'Determining the asymptotes',
        problem: R`Find the asymptotes of the function $f(x)=\dfrac{2x^2+1}{x-1}$.`,
        steps: [
          R`Vertical: the denominator is zero at $x=1$, the numerator there is $3\neq0$, so $\lim_{x\to1^\pm}f(x)=\pm\infty$ — $x=1$ is a vertical asymptote.`,
          R`Polynomial division: $2x^2+1=(x-1)(2x+2)+3$, that is $f(x)=2x+2+\frac{3}{x-1}$.`,
          R`Slanted: $m=\lim\frac{f(x)}{x}=2$, $b=\lim(f(x)-2x)=2$, hence $y=2x+2$.`,
          R`There is no horizontal asymptote, because $f(x)\to\pm\infty$ in the two directions.`
        ],
        answer: R`$x=1$ (vertical), $y=2x+2$ (slanted); no horizontal asymptote.`
      },
      {
        title: 'Power form at infinity',
        problem: R`Compute: $\displaystyle\lim_{x\to\infty}\left(1+\frac2x\right)^x$.`,
        steps: [
          R`Rewrite: $\left(1+\frac2x\right)^x=\left[\left(1+\frac2x\right)^{x/2}\right]^{2}$.`,
          R`With the substitution $u=\frac x2\to\infty$ the inner bracket is $\left(1+\frac1u\right)^u\to e$.`,
          R`The outer power is continuous, so the limit is $e^2$.`
        ],
        answer: R`$e^2$`
      }
    ],
    mistakes: [
      R`We think $\frac{\sin 5x}{x}\to0$, "because the sine is small". In fact it tends to $5$, because the ratio of the inner $5x$ to the denominator $x$ is what matters.`,
      R`For $\left(1+\frac1x\right)^x$ we take the limits of the parts separately and write $1^\infty=1$. The correct value is $e$.`,
      R`For a slanted asymptote we compute only $m$ and forget the shift $b$ — but $y=mx$ and $y=mx+b$ are not the same line.`,
      R`We apply L'Hôpital also to forms other than $0/0$ or $\infty/\infty$, for example to $\frac{x+1}{x}$, where the answer is simply $1$.`
    ],
    exercises: [
      { q: R`Compute: $\displaystyle\lim_{x\to0}\frac{\sin 3x}{x}$.`, hint: R`$\frac{\sin3x}{x}=3\cdot\frac{\sin3x}{3x}$.`, sol: R`$3\cdot1=3$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to0}\frac{e^x-1}{x}$.`, hint: R`A notable limit.`, sol: R`By the notable limit it is $1$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to0}\frac{e^{2x}-1}{x}$.`, hint: R`Multiply by $2$: $\frac{e^{2x}-1}{2x}\cdot2$.`, sol: R`$2\cdot1=2$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to0}\frac{\ln(1+5x)}{x}$.`, hint: R`$\frac{\ln(1+5x)}{5x}\cdot5$.`, sol: R`By the notable limit, $1\cdot5=5$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to\infty}\left(1+\frac3x\right)^x$. Give the answer in closed form.`, hint: R`Rewrite it as $\left[\left(1+\frac3x\right)^{x/3}\right]^3$.`, sol: R`The inner part tends to $e$, so the limit is $e^3$.` },
      { q: R`What is the equation of the slanted asymptote of the function $f(x)=\dfrac{x^2+1}{x-1}$?`, hint: R`Perform the polynomial division: $x^2+1=(x-1)(x+1)+2$.`, sol: R`$f(x)=x+1+\frac{2}{x-1}$, so $m=1$, $b=1$, and the asymptote is $y=x+1$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to0}\frac{\tan x}{x}$.`, hint: R`$\tan x=\frac{\sin x}{\cos x}$, and $\cos x\to1$.`, sol: R`$\frac{\tan x}{x}=\frac{\sin x}{x}\cdot\frac{1}{\cos x}\to1\cdot1=1$.` },
      { q: R`Prove that $\displaystyle\lim_{x\to0}\frac{\sin x}{x}=1$.`, hint: R`Use the inequality $\sin x<x<\tan x$ valid for $0<x<\frac\pi2$, and the squeeze theorem.`, sol: R`For $0<x<\frac\pi2$, comparing areas gives $\sin x<x<\tan x$. Dividing by $\sin x>0$: $1<\frac{x}{\sin x}<\frac{1}{\cos x}$, that is $\cos x<\frac{\sin x}{x}<1$. Since $\cos x\to1$, the squeeze theorem gives $\frac{\sin x}{x}\to1$. Being an odd function, the statement holds for negative $x$ as well.` }
    ],
    video: { title: 'Advanced analysis', channel: 'FZsMatek' }
  };
})();
