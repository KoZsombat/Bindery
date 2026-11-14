(function () {
  var R = String.raw;
  var MB = window.MB;
  MB.enContent = MB.enContent || {};

  MB.enContent['derivalas/derivalt-definicio'] = {
    title: 'The definition of the derivative, the tangent line',
    lead: R`The difference quotient is still an average speed: $\frac{f(x+h)-f(x)}{h}$. The derivative is the instantaneous speed, obtained by letting $h\to0$. Geometrically, the slope of the secant becomes the slope of the tangent.`,
    why: [
      R`If a car covers $120$ km in $2$ hours, its average speed is $60\ \mathrm{km/h}$. The speedometer, however, does not show an average but an instantaneous value: an average speed taken over shorter and shorter time intervals. That is exactly the limit of the difference quotient. The same idea works for any quantity: the rate of temperature change, the decay of a concentration, the growth rate of profit. The derivative is therefore not an abstract game but the mathematical form of the question "how fast".`,
      R`Differentiability is a stronger requirement than continuity, and it is worth seeing this precisely. Continuity says that the graph does not break apart; differentiability says that it has no corner either — there is a well-defined tangent. The function $|x|$ is continuous at $0$ but "pointed": from the left the difference quotient tends to $-1$, from the right to $+1$, so the derivative does not exist. This example shows why the definition of the derivative requires a two-sided limit, and why one cannot infer differentiability from continuity.`
    ],
    when: R`You need to go back to the definition when you must decide whether a derivative exists (for example an absolute value, or the matching of a piecewise defined function), when you must prove a statement, or when you must differentiate a function for which no ready formula is available. In the ZH exams, differentiating from the definition is a task in its own right, and the equation of the tangent line also comes up regularly.`,
    theory: [
      {
        title: 'Difference quotient',
        body: R`The difference quotient of the function $f$ at the point $a$ with step $h$ is
$$\frac{f(a+h)-f(a)}{h}.$$
Geometrically this is the slope of the secant line connecting the points $(a,f(a))$ and $(a+h,f(a+h))$, and physically it is the average rate of change on the interval $[a,a+h]$.`
      },
      {
        title: 'Derivative',
        body: R`The function $f$ is differentiable at the point $a$ if the limit
$$f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h}$$
exists and is finite. This number is called the derivative of the function at $a$. An equivalent form: $f'(a)=\lim_{x\to a}\frac{f(x)-f(a)}{x-a}$. The derivative function is the mapping $x\mapsto f'(x)$; its notation is $f'(x)$, $\frac{df}{dx}$ or $Df(x)$.`
      },
      {
        title: 'Equation of the tangent line',
        note: R`The tangent is the linear function that best approximates $f$ near $x_0$. Hence $f(x_0+h)\approx f(x_0)+f'(x_0)h$ — this is the linear approximation, the basis of every numerical approximation.`
      },
      {
        title: 'Differentiable ⇒ continuous',
        body: R`If $f$ is differentiable at the point $a$, then it is also continuous there.
Proof: $f(x)-f(a)=\frac{f(x)-f(a)}{x-a}\,(x-a)$. As $x\to a$, the first factor tends to $f'(a)$ and the second to $0$, so the product tends to $0$, that is $f(x)\to f(a)$.`,
        note: 'The converse is false — see the next block.'
      },
      {
        title: 'The converse does not hold: $|x|$',
        body: R`The function $f(x)=|x|$ is continuous at $0$ but not differentiable there. From the left $\frac{|0+h|-0}{h}=\frac{-h}{h}=-1$, from the right $\frac{h}{h}=1$; the two one-sided limits are different, so the derivative does not exist. The graph has a corner: a tangent would be acceptable "from either direction", so there is no single well-defined slope.`
      },
      {
        title: 'One-sided derivatives and derivatives on an interval',
        body: R`The left derivative is $f'_-(a)=\lim_{h\to0^-}\frac{f(a+h)-f(a)}{h}$, the right derivative is $f'_+(a)=\lim_{h\to0^+}\frac{f(a+h)-f(a)}{h}$. The function is differentiable at $a$ exactly when both one-sided derivatives exist and are equal. It is differentiable on an open interval if it is differentiable at every point of it; on a closed interval we require the appropriate one-sided derivative to exist at the endpoints.`
      },
      {
        title: 'Notation, higher derivatives',
        body: R`The derivative of the derivative is $f''$ (the second derivative), written $\frac{d^2f}{dx^2}$. In general $f^{(n)}$ is the $n$-th derivative. In physics: if $s(t)$ is position, then $s'(t)=v(t)$ is velocity and $s''(t)=a(t)$ is acceleration — the second derivative is the rate of change of the rate of change.`
      },
      {
        title: 'Why is the derivative of $x^2$ equal to $2x$?',
        body: R`$\frac{(x+h)^2-x^2}{h}=\frac{x^2+2xh+h^2-x^2}{h}=2x+h$. The limit as $h\to0$ is $2x$. The $h^2$ term disappears because it tends to zero faster than $h$: the derivative "sees" only the linear term. This pattern works for every polynomial, which is why $(x^n)'=nx^{n-1}$.`
      }
    ],
    examples: [
      {
        title: 'Derivative from the definition',
        problem: R`Find the derivative of $f(x)=x^2$ from the definition.`,
        steps: [
          R`Write down the difference quotient: $\frac{f(x+h)-f(x)}{h}=\frac{(x+h)^2-x^2}{h}$.`,
          R`Expand: $(x+h)^2=x^2+2xh+h^2$.`,
          R`After subtracting: $\frac{2xh+h^2}{h}=2x+h$ (here $h\neq0$).`,
          R`Limit: $2x+h\to 2x$, hence $f'(x)=2x$.`
        ],
        answer: R`$f'(x)=2x$`
      },
      {
        title: 'Equation of the tangent line',
        problem: R`Write down the tangent line to the graph of $f(x)=x^2$ at the point $x_0=1$.`,
        steps: [
          R`The ordinate of the point: $f(1)=1$, so the point of tangency is $(1,1)$.`,
          R`The slope: $f'(x)=2x$, therefore $f'(1)=2$.`,
          R`The tangent: $y=f(1)+f'(1)(x-1)=1+2(x-1)$.`,
          R`Rearranging: $y=2x-1$.`
        ],
        answer: R`$y=2x-1$`
      },
      {
        title: 'Differentiability at a point, with a parameter',
        problem: R`For which values of $a,b$ is the function $f(x)=x^2$ ($x\le1$), $f(x)=ax+b$ ($x>1$) differentiable at the point $x=1$?`,
        steps: [
          R`Differentiability ⇒ continuity, so first the pieces must be matched: from the left $f(1)=1$, from the right $a\cdot1+b$. Hence $a+b=1$.`,
          R`Left derivative: $(x^2)'=2x$, its value at $x=1$ is $2$.`,
          R`Right derivative: $(ax+b)'=a$, equal to $a$ everywhere.`,
          R`The derivative exists when $f'_-(1)=f'_+(1)$, that is $a=2$.`,
          R`From the continuity condition $b=1-a=-1$.`
        ],
        answer: R`$a=2$, $b=-1$`
      }
    ],
    mistakes: [
      R`Identifying the derivative with the difference quotient and forgetting the limit $h\to0$.`,
      R`Believing that continuity implies differentiability ($|x|$ refutes this).`,
      R`Leaving out the $f(x_0)$ term from the equation of the tangent and writing $y=f'(x_0)(x-x_0)$ — this gives the parallel line through the origin, not the tangent.`,
      R`Claiming that the derivative of $|x|$ at $0$ is $1$ or $-1$. The derivative does not exist there, because the one-sided derivatives differ.`
    ],
    exercises: [
      { q: R`What is the derivative of $f(x)=x^2$ at the point $x=3$?`, hint: R`$f'(x)=2x$.`, sol: R`$f'(3)=2\cdot3=6$.` },
      { q: R`Give the derivative of $f(x)=x^3$ (computing from the definition gives the same result).`, hint: R`$(x+h)^3=x^3+3x^2h+3xh^2+h^3$.`, sol: R`$\frac{(x+h)^3-x^3}{h}=3x^2+3xh+h^2\to3x^2$.` },
      { q: R`What is the equation of the tangent line to the curve $f(x)=x^2$ at the point $x_0=2$?`, hint: R`$f(2)=4$, $f'(2)=4$; use $y=f(x_0)+f'(x_0)(x-x_0)$.`, sol: R`$y=4+4(x-2)=4x-4$.` },
      { q: R`Give the derivative of $f(x)=\dfrac1x$ ($x\neq0$).`, hint: R`$\frac{1}{h}\left(\frac{1}{x+h}-\frac1x\right)$; bring it to a common denominator.`, sol: R`$\frac{x-(x+h)}{h\,x(x+h)}=\frac{-1}{x(x+h)}\to-\frac{1}{x^2}$.` },
      {
        q: R`Is the function $f(x)=|x|$ differentiable at the point $x=0$?`,
        choices: ['Yes, the derivative is 0', 'Yes, the derivative is 1', 'No, because the one-sided derivatives differ', 'No, because the function is not continuous'],
        sol: R`From the left the difference quotient is $-1$, from the right $+1$; the limit does not exist, so the function is not differentiable. The function, however, is continuous at $0$.`
      },
      { q: R`What is the derivative of $f(x)=\sqrt x$ at the point $x=4$?`, hint: R`$\frac{\sqrt{4+h}-2}{h}$; expand by the conjugate of the numerator.`, sol: R`$\frac{4+h-4}{h(\sqrt{4+h}+2)}=\frac{1}{\sqrt{4+h}+2}\to\frac{1}{4}$.` },
      { q: R`Prove that if $f$ is differentiable at the point $a$, then it is continuous there.`, hint: R`Write $f(x)-f(a)$ as the product of the difference quotient and $(x-a)$.`, sol: R`$f(x)-f(a)=\frac{f(x)-f(a)}{x-a}(x-a)$. As $x\to a$, the quotient tends to $f'(a)$ (because of differentiability), and the factor $(x-a)$ tends to $0$. Hence the limit of the product is $f'(a)\cdot0=0$, that is $f(x)\to f(a)$: the function is continuous at $a$.` },
      { q: R`The function $f(x)=x^2$ ($x\le2$), $f(x)=ax+b$ ($x>2$) is differentiable at the point $x=2$. What is $a$?`, hint: R`First continuity ($4=2a+b$), then equality of the derivatives ($4=a$).`, sol: R`Continuity: $2a+b=4$. Derivative: from the left $2x\to4$, from the right $a$, so $a=4$, and then $b=-4$.` }
    ],
    video: { title: 'Basics of differentiation', channel: 'FZsMatek' }
  };

  MB.enContent['derivalas/derivalt-szabalyok'] = {
    title: 'Differentiation rules, the chain rule',
    lead: R`Differentiation is a linear operation, so it splits over sums and constant multiples. For products and quotients an extra term appears, and for composite functions the chain rule: $(f(g(x)))'=f'(g(x))g'(x)$. With these rules practically every elementary expression can be differentiated.`,
    why: [
      R`The rules are not separate theorems but consequences of the definition of the derivative. In a product both factors change, so the change has two parts: "$f$ changes, $g$ stays" and "$g$ changes, $f$ stays" — hence $(fg)'=f'g+fg'$. The chain rule says that the change is "multiplied through": if $g$ responds to a change in $x$ at rate $g'$, and $f$ responds to a change in $g$ at rate $f'$, then the resulting rate is the product of the two. That is why it contains a product, not a sum.`,
      R`Without the chain rule practice would stop: engineering formulas are almost all composite functions ($e^{-t/\tau}$, $\sin(\omega t+\varphi)$, $\ln(1+x^2)$). Logarithmic differentiation opens up cases for which the table offers no formula: $x^x$, $(\sin x)^x$, or in general any expression of the form $f(x)^{g(x)}$. Both follow from the same idea, that differentiation can be decomposed through the product and chain rules.`
    ],
    when: R`In every differentiation exercise, but especially for composite functions (chain rule), fractions (quotient rule), products with many factors (logarithmic differentiation), and when the derivative of an expression containing a parameter is needed. In the ZH exams differentiation earns points on its own, but the exercises of 6.3 and 6.4 build on these rules as well.`,
    theory: [
      {
        title: 'Basic derivatives',
        note: R`For a power function $x>0$ if the exponent is real; for logarithms $x>0$, $a>0$, $a\neq1$.`
      },
      {
        title: 'Sum, constant, product, quotient',
        body: R`\begin{aligned}
(cf)' &= cf', & (f\pm g)' &= f'\pm g',\\
(fg)' &= f'g+fg', & \left(\frac fg\right)' &= \frac{f'g-fg'}{g^2}.
\end{aligned}`,
        note: R`The quotient rule requires $g(x)\neq0$; the order of the terms in the numerator cannot be swapped (it is not $fg'-f'g$).`
      },
      {
        title: 'Chain rule',
        body: R`If $g$ is differentiable at $x$ and $f$ is differentiable at $g(x)$, then
$$[f(g(x))]'=f'(g(x))\cdot g'(x).$$
In words: the derivative of the outer function at the value of the inner function, multiplied by the derivative of the inner function. For multiple compositions it can be chained: $[f(g(h(x)))]'=f'(g(h(x)))\,g'(h(x))\,h'(x)$.`
      },
      {
        title: 'Why is the chain rule a product?',
        body: R`Let $\Delta g$ denote the change of the inner function. Then $\Delta f\approx f'(g)\,\Delta g$ and $\Delta g\approx g'(x)\,\Delta x$, therefore $\frac{\Delta f}{\Delta x}\approx f'(g)\,g'(x)$. In the limit $h\to0$ the approximation becomes an equality. The point is that the two rates multiply, because the inner change is "passed on" to the outer function.`
      },
      {
        title: 'Logarithmic differentiation',
        body: R`If $y=f(x)^{g(x)}$ (variable base and variable exponent), take the logarithm of both sides: $\ln y=g(x)\ln f(x)$, then differentiate implicitly: $\frac{y'}{y}=g'\ln f+g\frac{f'}{f}$. Hence $y'=y\left(g'\ln f+g\frac{f'}{f}\right)$. For example, for $y=x^x$ we get $\ln y=x\ln x$, $\frac{y'}{y}=\ln x+1$, so $y'=x^x(\ln x+1)$.`
      },
      {
        title: 'Tangent and cotangent',
        note: R`Both come from the quotient rule: $\tan x=\frac{\sin x}{\cos x}$.`
      },
      {
        title: 'The most common mistakes',
        body: R`$(fg)'\neq f'g'$ and $\left(\frac fg\right)'\neq\frac{f'}{g'}$. The derivative of $\sin^2x$ is $2\sin x\cos x=\sin2x$, not $\cos^2x$ and not $2\sin x$. The derivative of $\sin(x^2)$ is $2x\cos(x^2)$ — because of the chain rule the factor $2x$ cannot be omitted.`
      },
      {
        title: 'Worth knowing by heart',
        items: [
          R`$(x^n)'=nx^{n-1}$ for every real $n$ (where defined).`,
          R`$(\sqrt x)'=\frac{1}{2\sqrt x}$, because $n=\frac12$.`,
          R`$(e^{kx})'=ke^{kx}$; $(a^{kx})'=ka^{kx}\ln a$.`,
          R`$(\ln(kx))'=\frac1x$ — the constant factor drops out.`
        ]
      }
    ],
    examples: [
      {
        title: 'Chain rule on a logarithm',
        problem: R`Differentiate: $f(x)=\ln(x^2+1)$.`,
        steps: [
          R`Outer function: $\ln u$, its derivative is $\frac1u$.`,
          R`Inner function: $u=x^2+1$, its derivative is $2x$.`,
          R`Chain rule: $f'(x)=\frac{1}{x^2+1}\cdot2x$.`,
          R`Simplified: $f'(x)=\frac{2x}{x^2+1}$.`
        ],
        answer: R`$f'(x)=\dfrac{2x}{x^2+1}$`
      },
      {
        title: 'Product rule',
        problem: R`Differentiate: $f(x)=x^3e^x$.`,
        steps: [
          R`Apply the rule $(fg)'=f'g+fg'$ with $f=x^3$, $g=e^x$.`,
          R`$f'=3x^2$, $g'=e^x$.`,
          R`$f'(x)=3x^2e^x+x^3e^x$.`,
          R`Factoring: $x^2e^x(3+x)$.`
        ],
        answer: R`$f'(x)=x^2e^x(x+3)$`
      },
      {
        title: 'Chain rule on a sine',
        problem: R`Differentiate: $f(x)=\sin(3x^2)$.`,
        steps: [
          R`Outer: $\sin u$, its derivative is $\cos u$.`,
          R`Inner: $u=3x^2$, its derivative is $6x$.`,
          R`$f'(x)=\cos(3x^2)\cdot6x$.`
        ],
        answer: R`$f'(x)=6x\cos(3x^2)$`
      },
      {
        title: 'Variable base and exponent',
        problem: R`Differentiate: $f(x)=x^x$ ($x>0$).`,
        steps: [
          R`Logarithm of both sides: $\ln f(x)=x\ln x$.`,
          R`Differentiate with respect to $x$ (implicitly on the left): $\frac{f'(x)}{f(x)}=\ln x+x\cdot\frac1x$.`,
          R`$\frac{f'(x)}{f(x)}=\ln x+1$.`,
          R`$f'(x)=f(x)(\ln x+1)=x^x(\ln x+1)$.`
        ],
        answer: R`$f'(x)=x^x(\ln x+1)$`
      }
    ],
    mistakes: [
      R`$(fg)'=f'g'$ — correctly $f'g+fg'$.`,
      R`In the chain rule the derivative of the inner function is omitted: instead of $(\sin(3x))'=\cos(3x)$ the correct answer is $3\cos(3x)$.`,
      R`In the numerator of the quotient rule the terms are swapped: correctly $f'g-fg'$, not $fg'-f'g$.`,
      R`$\ln x^2$ is differentiated as $\frac{1}{x^2}$. Correctly $\ln(x^2)=2\ln|x|$, whose derivative is $\frac2x$; with the chain rule $\frac{1}{x^2}\cdot2x=\frac2x$.`
    ],
    exercises: [
      { q: R`Differentiate: $f(x)=(x^2+1)^{10}$.`, hint: R`Chain rule: outer $u^{10}$, inner $x^2+1$.`, sol: R`$10(x^2+1)^9\cdot2x=20x(x^2+1)^9$.` },
      { q: R`Differentiate: $f(x)=x^3+2x$.`, hint: R`Differentiate term by term.`, sol: R`$(x^3)'=3x^2$, $(2x)'=2$, hence $3x^2+2$.` },
      { q: R`Differentiate: $f(x)=e^{x^2}$.`, hint: R`Outer $e^u$, inner $x^2$.`, sol: R`$e^{x^2}\cdot2x=2xe^{x^2}$.` },
      { q: R`Differentiate: $f(x)=\dfrac{x+1}{x-1}$.`, hint: R`Quotient rule: $\frac{1\cdot(x-1)-(x+1)\cdot1}{(x-1)^2}$.`, sol: R`$\frac{x-1-x-1}{(x-1)^2}=\frac{-2}{(x-1)^2}$.` },
      { q: R`Differentiate: $f(x)=\sin^2x$.`, hint: R`Write it as $\sin^2x=(\sin x)^2$ and apply the chain rule.`, sol: R`$2\sin x\cdot\cos x=\sin2x$.` },
      { q: R`Differentiate: $f(x)=\ln(\sin x)$ (where $\sin x>0$).`, hint: R`Outer $\ln u$, inner $\sin x$.`, sol: R`$\frac{1}{\sin x}\cdot\cos x=\cot x$.` },
      { q: R`What is the derivative of $f(x)=x^x$ at the point $x=1$?`, hint: R`$f'(x)=x^x(\ln x+1)$.`, sol: R`$f'(1)=1^1(\ln1+1)=1$.` },
      { q: R`Prove that $(fgh)'=f'gh+fg'h+fgh'$ (assuming all three are differentiable).`, hint: R`Apply the product rule twice: first to $fg$, then to the resulting product.`, sol: R`$(fgh)'=((fg)h)'=(fg)'h+(fg)h'=(f'g+fg')h+fgh'=f'gh+fg'h+fgh'$. Applying the product rule twice can be extended to any number of factors by induction.` }
    ],
    video: { title: 'Forming composite functions', channel: 'FZsMatek' }
  };

  MB.enContent['derivalas/derivalt-inverz'] = {
    title: 'Inverse, implicit, parametric, elementary functions',
    lead: R`The chain rule extends differentiation in three directions: to inverse functions, to functions given implicitly, and to parametric curves. The same method yields the derivatives of the exponential, logarithmic, inverse trigonometric and hyperbolic functions — they do not have to be memorised separately.`,
    why: [
      R`The formula for the derivative of the inverse function $\left(f^{-1}\right)'(y)=\frac{1}{f'(x)}$ (where $y=f(x)$) simply says: if $f$ responds to one unit of change with $f'$ units, then the reverse mapping responds to one unit with $\frac{1}{f'}$. This is not a new theorem but an application of the chain rule to the identity $f(f^{-1}(y))=y$. This gives the derivatives of all "inverse" functions: $\ln$, $a^x$, $\arcsin$, $\arctan$.`,
      R`Implicit and parametric descriptions enter when the function cannot be written in the form $y=f(x)$: the equation of a circle $x^2+y^2=25$ is not a function, and the path of a cycloid can only be described by a parameter. In implicit differentiation we treat $y$ as a function of $x$ and use the chain rule; in the parametric case we divide the two rates of change: $\frac{dy}{dx}=\frac{y'(t)}{x'(t)}$. Both are the same idea: the quotient of the rates of change gives the slope.`
    ],
    when: R`When differentiating inverse functions (especially when the formula must be derived), for the slope of a tangent to an implicit curve (circle, ellipse, level curve), for the velocity vector of a path given in parametric form, and in every ZH exercise that asks for "the slope of the tangent at the point $P$" on a curve not of the form $y=f(x)$.`,
    theory: [
      {
        title: 'Derivative of the inverse function',
        body: R`If $f$ is strictly monotone and differentiable at the point $x$, $f'(x)\neq0$, and moreover $f^{-1}$ is differentiable at the point $y=f(x)$, then
$$\left(f^{-1}\right)'(y)=\frac{1}{f'(x)},\qquad\text{where } y=f(x).$$
Proof: $f\left(f^{-1}(y)\right)=y$. Differentiating both sides with the chain rule gives $f'\left(f^{-1}(y)\right)\cdot\left(f^{-1}\right)'(y)=1$, from which the statement follows.`
      },
      {
        title: R`Where does $(\arcsin x)'$ come from?`,
        body: R`Let $y=\arcsin x$, that is $x=\sin y$ with $y\in\left(-\frac\pi2,\frac\pi2\right)$. Differentiating: $1=\cos y\cdot y'$, so $y'=\frac{1}{\cos y}$. On the interval $\left(-\frac\pi2,\frac\pi2\right)$ we have $\cos y>0$, hence $\cos y=\sqrt{1-\sin^2y}=\sqrt{1-x^2}$. Thus $(\arcsin x)'=\frac{1}{\sqrt{1-x^2}}$. In the same way $(\arctan x)'=\frac{1}{1+x^2}$.`
      },
      {
        title: 'Exponential and logarithmic',
        note: R`Rewriting $a^x=e^{x\ln a}$ and using the chain rule gives $(a^x)'=e^{x\ln a}\ln a=a^x\ln a$.`
      },
      {
        title: 'Inverse trigonometric',
        note: 'Domain: $|x|<1$ for the inverse sines and cosines, every real $x$ for the arctangent.'
      },
      {
        title: 'Hyperbolic functions',
        body: R`$\sinh x=\frac{e^x-e^{-x}}{2}$, $\cosh x=\frac{e^x+e^{-x}}{2}$, and $\cosh^2x-\sinh^2x=1$. Their derivatives: $(\sinh x)'=\cosh x$, $(\cosh x)'=\sinh x$ — here there is no minus sign, which is the main difference from the trigonometric pair. For the inverse hyperbolic functions, for example $(\operatorname{arsinh} x)'=\frac{1}{\sqrt{x^2+1}}$.`
      },
      {
        title: 'Implicit differentiation',
        body: R`Let the curve be given in the form $F(x,y)=0$, and assume that in a neighbourhood of a point the curve can be written as a function $y=y(x)$. Differentiate both sides with respect to $x$, treating $y$ as $y(x)$ (chain rule!), then express $y'$. If $F$ is differentiable and $F_y\neq0$, then
$$y'=-\frac{F_x}{F_y}.$$`
      },
      {
        title: 'Parametric curve',
        body: R`If the curve is given by $x=x(t)$, $y=y(t)$ and $x'(t)\neq0$, then
$$\frac{dy}{dx}=\frac{y'(t)}{x'(t)}.$$
The second derivative: $\frac{d^2y}{dx^2}=\frac{\left(\frac{dy}{dx}\right)'(t)}{x'(t)}$ — here the inner quotient must first be differentiated with respect to $t$, and then divided by $x'(t)$.`
      },
      {
        title: 'Conditions that are easy to forget',
        body: R`For the inverse we need $f'(x)\neq0$: the inverse of $y=x^3$ is $x=\sqrt[3]y$, and at $x=0$ the derivative is infinite (vertical tangent). For parametric curves $x'(t)\neq0$: if $x'(t)=0$, the curve has a vertical tangent and $\frac{dy}{dx}$ is not defined. For the implicit case $F_y\neq0$ ensures that locally $y$ can be expressed in terms of $x$.`
      }
    ],
    examples: [
      {
        title: 'Deriving the arcsine formula',
        problem: R`Derive the formula for $(\arcsin x)'$.`,
        steps: [
          R`$y=\arcsin x\iff x=\sin y$, where $y\in\left(-\frac\pi2,\frac\pi2\right)$.`,
          R`Differentiating with respect to $x$: $1=\cos y\cdot y'$.`,
          R`$y'=\frac{1}{\cos y}$, and on the given interval $\cos y>0$, so $\cos y=\sqrt{1-\sin^2y}=\sqrt{1-x^2}$.`,
          R`Therefore $(\arcsin x)'=\frac{1}{\sqrt{1-x^2}}$.`
        ],
        answer: R`$(\arcsin x)'=\dfrac{1}{\sqrt{1-x^2}}$`
      },
      {
        title: 'Implicit differentiation on a circle',
        problem: R`Find the slope of the tangent to the circle $x^2+y^2=25$ at the point $P(3,4)$.`,
        steps: [
          R`Differentiate both sides with respect to $x$, with $y=y(x)$: $2x+2y\,y'=0$.`,
          R`Expressing it: $y'=-\frac{x}{y}$.`,
          R`At the point $P(3,4)$: $y'=-\frac34$.`,
          R`The tangent: $y-4=-\frac34(x-3)$, that is $y=-\frac34x+\frac{25}{4}$.`
        ],
        answer: R`$m=-\dfrac34$, the tangent is $y=-\dfrac34x+\dfrac{25}{4}$`
      },
      {
        title: 'Slope of a parametric curve',
        problem: R`What is $\frac{dy}{dx}$ at a point of the curve $x=t^2$, $y=t^3$? Compute it at $t=1$.`,
        steps: [
          R`$x'(t)=2t$, $y'(t)=3t^2$.`,
          R`$\frac{dy}{dx}=\frac{y'(t)}{x'(t)}=\frac{3t^2}{2t}=\frac{3t}{2}$ (where $t\neq0$).`,
          R`At $t=1$ the slope is $\frac32$; the point is $(1,1)$.`,
          R`Remark: at $t=0$ we have $x'(0)=0$; there the curve has a cusp and the slope is not defined.`
        ],
        answer: R`$\dfrac{dy}{dx}=\dfrac{3t}{2}$; at $t=1$ it is $\dfrac32$`
      },
      {
        title: 'Derivative with exponential base',
        problem: R`Derive the formula for $(a^x)'$ ($a>0$).`,
        steps: [
          R`Rewrite: $a^x=e^{x\ln a}$.`,
          R`Chain rule: the derivative of the outer $e^u$ is $e^u$, the derivative of the inner $x\ln a$ is $\ln a$.`,
          R`$(a^x)'=e^{x\ln a}\cdot\ln a=a^x\ln a$.`,
          R`Check for $a=e$: $\ln e=1$, and indeed $(e^x)'=e^x$.`
        ],
        answer: R`$(a^x)'=a^x\ln a$`
      }
    ],
    mistakes: [
      R`Using the derivative of the inverse as the reciprocal of the derivative, but at the wrong point: $\left(f^{-1}\right)'(y)=\frac{1}{f'(x)}$ where $y=f(x)$ — not $\frac{1}{f'(y)}$.`,
      R`In implicit differentiation $y^2$ is differentiated as $2y$, forgetting the chain rule: correctly $2y\,y'$.`,
      R`For parametric curves one writes $\frac{dy}{dx}=\frac{x'(t)}{y'(t)}$; the correct order is $\frac{y'(t)}{x'(t)}$.`,
      R`Forgetting the domain: $(\arcsin x)'$ is defined only for $|x|<1$, $(\ln x)'$ only for $x>0$.`
    ],
    exercises: [
      { q: R`Give the formula for $(\arctan x)'$.`, hint: R`The inverse of $\arctan$ is $\tan$, and $(\tan y)'=1+\tan^2y$.`, sol: R`$x=\tan y\Rightarrow1=(1+\tan^2y)y'$, hence $y'=\frac{1}{1+x^2}$.` },
      { q: R`Differentiate: $f(x)=e^{3x}$.`, hint: R`Chain rule, the inner function is $3x$.`, sol: R`$e^{3x}\cdot3=3e^{3x}$.` },
      { q: R`Differentiate: $f(x)=\arcsin\dfrac x2$.`, hint: R`Chain rule: $\frac{1}{\sqrt{1-(x/2)^2}}\cdot\frac12$.`, sol: R`$\frac{1/2}{\sqrt{1-x^2/4}}=\frac{1}{\sqrt{4-x^2}}$.` },
      { q: R`With what slope does the curve $x^2+xy+y^2=3$ pass through the point $(1,1)$?`, hint: R`Differentiate implicitly: $2x+y+xy'+2yy'=0$.`, sol: R`$y'=-\frac{2x+y}{x+2y}$; at the point $(1,1)$ this is $-\frac{3}{3}=-1$.` },
      { q: R`For the parametric circle $x=\cos t$, $y=\sin t$, what is $\frac{dy}{dx}$?`, hint: R`$\frac{y'(t)}{x'(t)}=\frac{\cos t}{-\sin t}$.`, sol: R`$\frac{dy}{dx}=-\frac{\cos t}{\sin t}=-\cot t$.` },
      { q: R`Differentiate: $f(x)=\ln(\cos x)$ (where $\cos x>0$).`, hint: R`Outer $\ln u$, inner $\cos x$.`, sol: R`$\frac{1}{\cos x}\cdot(-\sin x)=-\tan x$.` },
      { q: R`Prove the differentiation rule for the inverse function: $\left(f^{-1}\right)'(y)=\dfrac{1}{f'(x)}$, where $y=f(x)$.`, hint: R`Start from the identity $f\left(f^{-1}(y)\right)=y$ and differentiate both sides with respect to $y$.`, sol: R`Differentiating both sides of the identity $f\left(f^{-1}(y)\right)=y$ with respect to $y$, the chain rule gives $f'\left(f^{-1}(y)\right)\cdot\left(f^{-1}\right)'(y)=1$. Since $f^{-1}(y)=x$, this yields $\left(f^{-1}\right)'(y)=\frac{1}{f'(x)}$, assuming $f'(x)\neq0$.` },
      { q: R`The parametric equation of the cycloid is $x=t-\sin t$, $y=1-\cos t$. What is $\frac{dy}{dx}$?`, hint: R`$x'(t)=1-\cos t$, $y'(t)=\sin t$.`, sol: R`$\frac{dy}{dx}=\frac{\sin t}{1-\cos t}$ (which for $t\neq0$ also equals $\cot\frac t2$).` }
    ],
    video: { title: 'Inverse and implicit differentiation', channel: 'Hungarian mathematics channels' }
  };

  MB.enContent['derivalas/derivalt-fuggvenyvizsgalat'] = {
    title: "L'Hôpital, curve sketching, extrema",
    lead: R`The derivative is not just computation: it shapes the graph. From its sign we get monotonicity, from its zeros extrema, from the sign of the second derivative convexity and inflection. The same tool gives the strongest method for computing limits, the L'Hôpital rule — which, however, is valid only for the appropriate forms.`,
    why: [
      R`The sign of the derivative tells directly where the function goes: where $f'>0$ it increases, where $f'<0$ it decreases. It follows that an extremum at an interior point is possible only if the derivative changes sign — this is Fermat's theorem, the necessary condition. The second derivative repeats the same idea for the slope: $f''>0$ means that the slope increases, so the curve bends upwards (convex). An inflection point is where the curve switches from concave to convex — there the second derivative changes sign.`,
      R`On a closed interval the global extremum cannot be found only among the zeros of the derivative: by the Weierstrass theorem a continuous function attains its maximum and minimum, but this may happen at the endpoints. That is why the investigation always involves three types of candidates: stationary points, endpoints, and points where the function is not differentiable. The L'Hôpital rule is a by-product of the same machinery: it replaces a $0/0$ form by the limit of the quotient of the tangents.`
    ],
    when: R`For curve sketching (monotonicity, extrema, inflection, sketch), for extremum problems (on a closed interval or in word problems), and for every limit of the form $0/0$ or $\infty/\infty$. In the ZH exams curve sketching is a separate, graded task, and L'Hôpital can be a quick way to earn points — provided the form is checked first.`,
    theory: [
      {
        title: "L'Hôpital rule",
        body: R`Let $f,g$ be differentiable in a neighbourhood of the point $a$ and $g'(x)\neq0$ there. If $\lim_{x\to a}\frac{f(x)}{g(x)}$ has the form $\frac00$ or $\frac{\infty}{\infty}$, and $\lim_{x\to a}\frac{f'(x)}{g'(x)}$ exists (finite or $\pm\infty$), then
$$\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}.$$
The statement is also true for $x\to\pm\infty$.`,
        note: 'The rule is directional: if the quotient of the derivatives has no limit, it does not follow that the original quotient has none either (see the warning).'
      },
      {
        title: 'The other indeterminate forms',
        body: R`The forms $0\cdot\infty$, $\infty-\infty$, $1^\infty$, $0^0$ and $\infty^0$ must first be transformed. $0\cdot\infty$ is written as a fraction ($f g=\frac{f}{1/g}$), a difference is brought to a common denominator, and a power is take the logarithm of: $f^g=e^{g\ln f}$, and we compute the limit of the exponent $g\ln f$ (which has the form $0\cdot\infty$).`
      },
      {
        title: 'Monotonicity',
        body: R`If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$, then for $f'>0$ it is strictly increasing, for $f'<0$ strictly decreasing, and for $f'=0$ constant. The proof rests on the Lagrange mean value theorem: $f(x_2)-f(x_1)=f'(\xi)(x_2-x_1)$ for some $\xi$, and the sign of the right-hand side is determined by $f'(\xi)$.`
      },
      {
        title: 'Extrema: necessary and sufficient condition',
        body: R`If $f$ has a local extremum at $a$ and $f$ is differentiable at $a$, then $f'(a)=0$ (Fermat). This is only necessary: for $f(x)=x^3$ we have $f'(0)=0$, yet there is no extremum.
Sufficient: if $f$ is continuous at $a$, differentiable in a neighbourhood of it, and $f'$ changes sign at $a$ ($+\to-$: local maximum, $-\to+$: local minimum), then there is an extremum there. Alternative test: if $f'(a)=0$ and $f''(a)<0$, then it is a local maximum; if $f''(a)>0$, then it is a local minimum.`
      },
      {
        title: 'Convexity and inflection',
        body: R`$f''>0$ on the interval: convex (upward opening, "smiling") curve; $f''<0$: concave. At an inflection point the convexity of the curve changes, which requires $f''$ to change sign. $f''(x_0)=0$ alone is not enough: for $x^4$ we have $f''(0)=0$, but there is no inflection at $x=0$, because $f''$ does not change sign.`
      },
      {
        title: 'Global extrema on a closed interval',
        body: R`If $f$ is continuous on $[a,b]$, then by the Weierstrass theorem it attains its maximum and minimum. Candidates: (1) the stationary points, where $f'=0$; (2) the endpoints $a$ and $b$; (3) the points where $f$ is not differentiable. We compute the value of $f$ at each of them and choose the largest and the smallest.`
      },
      {
        title: 'Steps of curve sketching',
        items: [
          R`Domain, intercepts, periodicity, parity.`,
          R`Limits at the edges of the domain; asymptotes.`,
          R`Compute $f'$, its zeros, sign table: monotonicity and local extrema.`,
          R`Compute $f''$, its zeros, sign table: convexity and inflection points.`,
          R`Table of values at the notable points, then a sketch.`
        ]
      },
      {
        title: "Pitfalls of L'Hôpital",
        body: R`(1) Check the form: $\frac{x+1}{x}$ is not $0/0$, its limit is simply $1$; with L'Hôpital $\frac11=1$ comes out too, but by accident. (2) If the quotient of the derivatives has no limit, the rule cannot be applied, while the original limit may still exist: $\frac{x+\sin x}{x}\to1$, although $\frac{1+\cos x}{1}$ tends nowhere. (3) L'Hôpital is not a proof of the limit $\frac{\sin x}{x}$, because $(\sin x)'=\cos x$ itself comes from that limit.`
      }
    ],
    examples: [
      {
        title: "L'Hôpital, basic case",
        problem: R`Compute: $\displaystyle\lim_{x\to0}\frac{\sin x}{x}$.`,
        steps: [
          R`The form is $\frac00$, so the rule applies.`,
          R`Derivatives: $(\sin x)'=\cos x$, $(x)'=1$.`,
          R`$\lim_{x\to0}\frac{\cos x}{1}=\cos0=1$.`,
          R`Remark: this is only a computational check, not a proof — the formula would be circular. The proof is the squeeze argument of Chapter 5.2.`
        ],
        answer: R`$1$`
      },
      {
        title: 'Complete curve sketching',
        problem: R`Investigate the function $f(x)=x^3-3x$: monotonicity, extrema, convexity.`,
        steps: [
          R`$f'(x)=3x^2-3=3(x-1)(x+1)$, zeros at $x=\pm1$.`,
          R`Sign: for $x<-1$ we have $f'>0$ (increasing), for $-1<x<1$ $f'<0$ (decreasing), for $x>1$ $f'>0$ (increasing).`,
          R`Therefore there is a local maximum at $x=-1$ and a local minimum at $x=1$. Values: $f(-1)=2$, $f(1)=-2$.`,
          R`$f''(x)=6x$: concave for $x<0$, convex for $x>0$, inflection at $x=0$ (value $0$).`
        ],
        answer: R`Max: $(-1,2)$; min: $(1,-2)$; inflection: $(0,0)$; increasing on $(-\infty,-1)\cup(1,\infty)$, decreasing on $(-1,1)$.`
      },
      {
        title: 'Inflection via the second derivative',
        problem: R`Find the inflection points of the function $f(x)=e^{-x^2}$.`,
        steps: [
          R`$f'(x)=-2xe^{-x^2}$.`,
          R`$f''(x)=-2e^{-x^2}+(-2x)(-2x)e^{-x^2}=(4x^2-2)e^{-x^2}$.`,
          R`$f''=0$ exactly when $4x^2-2=0$, that is $x=\pm\frac{1}{\sqrt2}$.`,
          R`Because of the factor $e^{-x^2}>0$, the sign of $f''$ is given by $4x^2-2$: positive for $|x|>\frac{1}{\sqrt2}$, negative in between — so the sign changes at both places.`
        ],
        answer: R`$x=\pm\dfrac{1}{\sqrt2}$, the value is $e^{-1/2}=\dfrac{1}{\sqrt e}$`
      },
      {
        title: 'Global extrema on a closed interval',
        problem: R`Find the global maximum and minimum of $f(x)=x^3-3x$ on the interval $[0,3]$.`,
        steps: [
          R`Stationary points: $f'(x)=3x^2-3=0$ → $x=\pm1$; only $x=1$ lies in $[0,3]$.`,
          R`Values at the candidates: $f(0)=0$, $f(1)=1-3=-2$, $f(3)=27-9=18$.`,
          R`There are no points of non-differentiability, and the endpoints have been taken into account.`,
          R`The largest value is $18$ (at the endpoint $x=3$), the smallest is $-2$ (at $x=1$).`
        ],
        answer: R`Maximum: $18$ ($x=3$); minimum: $-2$ ($x=1$).`
      }
    ],
    mistakes: [
      R`For extrema on a closed interval only the stationary points are examined, not the endpoints — although the maximum may well be there.`,
      R`Treating $f'(a)=0$ as sufficient: $x^3$ has no extremum at $0$, although its derivative is zero there.`,
      R`Calling $f''=0$ an inflection without a sign change (for example $x^4$ at $0$).`,
      R`Applying L'Hôpital to a fraction that is not of the form $0/0$ or $\infty/\infty$, or when the quotient of the derivatives has no limit.`
    ],
    exercises: [
      { q: R`Compute with L'Hôpital: $\displaystyle\lim_{x\to0}\frac{e^x-1}{x}$.`, hint: R`Form $0/0$; differentiate the numerator and the denominator.`, sol: R`$\frac{e^x}{1}\to1$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to\infty}\frac{\ln x}{x}$.`, hint: R`Form $\infty/\infty$; after L'Hôpital, $\frac{1/x}{1}$.`, sol: R`$\frac{1/x}{1}=\frac1x\to0$.` },
      { q: R`Compute: $\displaystyle\lim_{x\to0}\frac{e^x-1-x}{x^2}$.`, hint: R`L'Hôpital must be applied twice.`, sol: R`First $\frac{e^x-1}{2x}$, then $\frac{e^x}{2}\to\frac12$.` },
      { q: R`How many local extrema does the function $f(x)=x^3-3x$ have?`, hint: R`$f'=3(x-1)(x+1)$; it changes sign at both places.`, sol: R`$x=-1$ (maximum) and $x=1$ (minimum), so two.` },
      { q: R`What is the value of the local maximum of the function $f(x)=x^2e^{-x}$?`, hint: R`$f'(x)=x(2-x)e^{-x}$; the maximum is at $x=2$.`, sol: R`$f(2)=4e^{-2}=\frac{4}{e^2}$.` },
      { q: R`How many inflection points does the function $f(x)=e^{-x^2}$ have?`, hint: R`$f''=(4x^2-2)e^{-x^2}$.`, sol: R`$f''=0$ at $x=\pm\frac{1}{\sqrt2}$, and it changes sign at both: two inflection points.` },
      { q: R`Find the minimum of the function $f(x)=x+\dfrac4x$ on the interval $[1,4]$.`, hint: R`$f'(x)=1-\frac{4}{x^2}$, the stationary point is $x=2$; check the endpoints as well.`, sol: R`$f'(x)=0\Rightarrow x=2$, $f(2)=4$; at the endpoints $f(1)=f(4)=5$. The minimum is therefore $4$.` },
      { q: R`Prove that if $f$ is continuous on $[a,b]$, differentiable on $(a,b)$ and $f'>0$, then $f$ is strictly increasing.`, hint: R`Use the Lagrange mean value theorem for two arbitrary points $x_1<x_2$.`, sol: R`Let $a\le x_1<x_2\le b$. By the Lagrange mean value theorem there is a $\xi\in(x_1,x_2)$ with $f(x_2)-f(x_1)=f'(\xi)(x_2-x_1)$. Since $f'(\xi)>0$ and $x_2-x_1>0$, the right-hand side is positive, so $f(x_2)>f(x_1)$: the function is strictly increasing.` }
    ],
    video: { title: 'Differentiation from the definition', channel: 'Felsőfok' }
  };
})();
