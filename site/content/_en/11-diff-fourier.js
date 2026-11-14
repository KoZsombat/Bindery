(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['diff-fourier/diffegyenletek'] = {
    title: 'First-order equations, isoclines, linear recurrences',
    lead: 'A first-order equation is geometrically a direction field: at every point it tells you which way the solution curve goes. A closed formula exists in two cases: when the equation is separable and when it is linear. A linear recurrence is the same idea with discrete steps, where the characteristic equation takes over the role of the differential equation.',
    summary: 'First-order differential equations: direction fields and isoclines, the solution of separable and linear equations, and linear recurrences through the characteristic equation, including the Fibonacci sequence.',
    why: [
      R`The equation $y'=f(x,y)$ does not tell you where the function is, but with what slope it continues at every point. That is why the solution is not a single curve but a family of curves: one from every initial point. The isoclines (the curves $f(x,y)=c$) are exactly the places where the solutions have slope $c$; drawing them makes the behaviour of the whole solution family visible without any computation.`,
      R`We can solve a separable equation because the variables separate: every $y$ goes to one side, every $x$ to the other, and then we integrate. For a linear equation the trick is different: with a factor $e^{\int p}$ the left-hand side becomes exactly the derivative of a product, so only integration is left. Both methods do the same thing: they bring the equation into a form we already know.`,
      R`For a recurrence we look for the solution in the form of an $n$-th power, because substituting the trial function $a_n=\lambda^n$ into the recurrence lets $\lambda^n$ be factored out and leaves an ordinary quadratic equation. This is why the solution is a linear combination of powers of the characteristic roots — and why the golden ratio appears in the Fibonacci sequence.`
    ],
    when: 'In physics (decay, cooling, oscillation, population dynamics), in computer science (running-time recurrences, signal filtering), in finance (interest, annuities). On the ZH (midterm) the first-order linear and the separable equation appear almost every time, and the recurrence mostly in Fibonacci or second-order linear form.',
    theory: [
      { title: 'Differential equation, solution, initial value', body: R`A solution of the first-order explicit equation $y'=f(x,y)$ is a differentiable function $y(x)$ on an interval for which $y'(x)=f(x,y(x))$ at every point. By general solution we mean the one-parameter family of solutions; the initial condition $y(x_0)=y_0$ selects a single curve.` },
      { title: 'Separable equation', note: 'At the places $g(y)=0$ there may be constant solutions, which the division can hide.' },
      { title: 'First-order linear equation', note: R`The factor is $\mu(x)=e^{\int p\,dx}$, with which $(\mu y)'=\mu q$ follows.` },
      { title: 'Isocline and direction field', body: R`The isocline of the equation $y'=f(x,y)$ for slope $c$ is the curve $f(x,y)=c$. Along the small segments drawn at the points of the plane (the direction field) the solution curves “hug” the isoclines. For example, for $y'=x+y$ the isoclines are the lines $x+y=c$.` },
      { title: 'Characteristic equation of a linear recurrence', body: R`If $a_n=pa_{n-1}+qa_{n-2}$, then substituting the trial solution $a_n=\lambda^n$ gives $\lambda^n=p\lambda^{n-1}+q\lambda^{n-2}$, that is $\lambda^2=p\lambda+q$. For two distinct real roots
$$a_n=A\lambda_1^n+B\lambda_2^n,$$
where $A,B$ are determined from the initial values.` },
      { title: 'Double and complex roots', body: R`If $\lambda_1=\lambda_2=\lambda$, then $a_n=(A+Bn)\lambda^n$. If the roots are complex, $\lambda=r(\cos\vartheta\pm i\sin\vartheta)$, then $a_n=r^n(C\cos n\vartheta+D\sin n\vartheta)$ — for a real sequence this is the real form.` },
      { title: 'Fibonacci sequence', body: R`$F_n=F_{n-1}+F_{n-2}$, $F_0=0$, $F_1=1$. The characteristic equation is $\lambda^2=\lambda+1$, with roots $\varphi=\frac{1+\sqrt5}{2}$ and $\psi=\frac{1-\sqrt5}{2}$. Hence
$$F_n=\frac{\varphi^n-\psi^n}{\sqrt5},$$
which gives an integer even for integer $n$ — this is Binet's formula.` },
      { title: 'Common mistakes', body: R`When separating, dividing by $g(y)$ may lose the constant solutions $g(y)=0$. When integrating, $\int\frac{dy}{y}=\ln|y|$, not $\ln y$. A recurrence needs two initial values, otherwise $A,B$ cannot be determined. The constant cannot be dropped from the general solution.` },
      { title: 'Solution recipe', items: [
        R`Separable: rearrange to the form $g(y)dy=f(x)dx$, then integrate both sides.`,
        R`Linear: compute $\mu=e^{\int p}$, multiply through, then integrate $(\mu y)'=\mu q$.`,
        R`Recurrence: write $\lambda^2-p\lambda-q=0$, solve it, then determine $A,B$ (or $C,D$) from the initial values.`,
        R`Check: substituting the resulting function back into the equation must give an identity.`
      ] }
    ],
    examples: [
      {
        title: 'Exponential growth',
        problem: R`Solve: $y'=ky$, where $k$ is a constant.`,
        steps: [
          R`Separable: $\dfrac{dy}{y}=k\,dx$ (the constant solution $y\equiv0$ separately).`,
          R`Integrating: $\ln|y|=kx+C$.`,
          R`Exponentiating: $|y|=e^{C}e^{kx}$, that is $y=Ce^{kx}$ (the sign of $C$ can be absorbed as well).`,
          R`With the initial condition $y(0)=y_0$: $C=y_0$, so $y=y_0e^{kx}$. This is the fundamental law of decay ($k<0$) and growth ($k>0$).`
        ],
        answer: R`$y=Ce^{kx}$`
      },
      {
        title: 'Separable equation',
        problem: R`Solve: $y'=xy$.`,
        steps: [
          R`$\dfrac{dy}{y}=x\,dx$; the solution $y\equiv0$ is also allowed.`,
          R`Integrating: $\ln|y|=\dfrac{x^2}{2}+C$.`,
          R`Hence $|y|=e^C e^{x^2/2}$, so $y=Ce^{x^2/2}$.`,
          R`Check: $y'=Cxe^{x^2/2}=xy$. This is the Gaussian function, which appears when integrating $e^{-x^2}$.`
        ],
        answer: R`$y=Ce^{x^2/2}$`
      },
      {
        title: 'First-order linear equation',
        problem: R`Solve: $y'+y=e^x$.`,
        steps: [
          R`Here $p(x)=1$, $q(x)=e^x$, so $\mu=e^{\int1\,dx}=e^x$.`,
          R`Multiplying: $e^x y'+e^x y=e^{2x}$, that is $(e^x y)'=e^{2x}$.`,
          R`Integrating: $e^x y=\dfrac{e^{2x}}{2}+C$.`,
          R`Dividing by $e^x$: $y=\dfrac{e^x}{2}+Ce^{-x}$.`,
          R`Check: $y'+y=\left(\frac{e^x}{2}-Ce^{-x}\right)+\left(\frac{e^x}{2}+Ce^{-x}\right)=e^x$.`
        ],
        answer: R`$y=\dfrac{e^x}{2}+Ce^{-x}$`
      },
      {
        title: 'Second-order linear recurrence',
        problem: R`Solve: $a_n=5a_{n-1}-6a_{n-2}$.`,
        steps: [
          R`The characteristic equation: $\lambda^2-5\lambda+6=0$, that is $(\lambda-2)(\lambda-3)=0$.`,
          R`Two distinct roots: $\lambda_1=2$, $\lambda_2=3$, therefore $a_n=A\cdot2^n+B\cdot3^n$.`,
          R`From the initial values (for example $a_0=0$, $a_1=1$): $A+B=0$ and $2A+3B=1$.`,
          R`From the first, $A=-B$; substituting gives $-2B+3B=1$, so $B=1$, $A=-1$.`,
          R`Thus $a_n=3^n-2^n$. Check: $a_2=9-4=5$, which the recurrence also gives ($5\cdot1-6\cdot0=5$); $a_3=27-8=19=5\cdot5-6\cdot1$.`
        ],
        answer: R`$a_n=A\cdot2^n+B\cdot3^n$, with the initial values $a_n=3^n-2^n$`
      }
    ],
    mistakes: [
      R`When separating, dividing by $y$ and losing the solution $y\equiv0$.`,
      R`Writing $\int\frac{dy}{y}=\ln y$ instead of $\ln|y|$, then getting a meaningless result for negative $y$.`,
      R`For the linear equation, omitting the factor $\mu$ or writing it with the wrong sign.`,
      R`For the recurrence, writing the characteristic equation as $p\lambda+q=0$ instead of $\lambda^2=p\lambda+q$.`
    ],
    exercises: [
      { q: R`What is the general solution of the equation $y'=3y$?`, hint: R`Separate: $dy/y=3dx$.`, sol: R`$\ln|y|=3x+C$, so $y=Ce^{3x}$.` },
      { q: R`Which curves are the isoclines of the equation $y'=x+y$?`, sol: R`$y'=c$ exactly when $x+y=c$, so the isoclines are parallel lines.`, choices: ['The lines $x+y=c$', 'The hyperbolas $xy=c$', 'The lines $y=cx$'] },
      { q: R`What is the general solution of the equation $y'+y=e^x$?`, hint: R`$\mu=e^x$; $(\mu y)'=\mu q$.`, sol: R`$(e^xy)'=e^{2x}\Rightarrow e^xy=e^{2x}/2+C\Rightarrow y=e^x/2+Ce^{-x}$.` },
      { q: R`For the sequence $a_n=5a_{n-1}-6a_{n-2}$, $a_0=0$, $a_1=1$, how much is $a_3$?`, hint: R`First $a_2=5a_1-6a_0$.`, sol: R`$a_2=5$, $a_3=5\cdot5-6\cdot1=19$. The closed form $3^n-2^n$: $27-8=19$.` },
      { q: R`What is the 10th term of the Fibonacci sequence ($F_0=0$, $F_1=1$)?`, hint: R`Write down the first few terms.`, sol: R`$0,1,1,2,3,5,8,13,21,34,55$, so $F_{10}=55$.` },
      { q: R`Solve: $y'=y^2$, $y(0)=1$. At which $x$ cannot the solution be continued?`, hint: R`$dy/y^2=dx$, then integrate.`, sol: R`$-1/y=x+C$; $y(0)=1\Rightarrow C=-1$, so $y=1/(1-x)$, which tends to infinity at $x=1$.` },
      { q: R`Prove that if $\lambda_1\neq\lambda_2$ are the roots of the characteristic equation, then $a_n=A\lambda_1^n+B\lambda_2^n$ is a solution for every $A,B$, and every solution has this form.`, sol: R`Substitution: $A\lambda_1^n+B\lambda_2^n=p(A\lambda_1^{n-1}+B\lambda_2^{n-1})+q(A\lambda_1^{n-2}+B\lambda_2^{n-2})$ holds exactly when $\lambda_i^2=p\lambda_i+q$, which is the characteristic equation. Conversely: for given $a_0,a_1$ the linear system $A+B=a_0$, $A\lambda_1+B\lambda_2=a_1$ is uniquely solvable, because the determinant is $\lambda_2-\lambda_1\neq0$. The sequence obtained this way satisfies the recurrence and the initial conditions, and the recurrence determines the sequence uniquely, so this is the only solution.` },
      { q: R`What is the general solution of the recurrence $a_n=2a_{n-1}-a_{n-2}$ when the characteristic equation has a double root?`, hint: R`The characteristic equation is $\lambda^2-2\lambda+1=(\lambda-1)^2=0$, so $\lambda=1$ is a double root.`, sol: R`For a double root $a_n=(A+Bn)\lambda^n$; here $\lambda=1$, so $a_n=A+Bn$.` }
    ],
    video: {
      title: 'First-order differential equations and linear recurrences',
      channel: 'Hungarian mathematics channels',
      note: 'Hungarian-language search: "elsőrendű differenciálegyenlet szeparábilis lineáris rekurzió karakterisztikus egyenlet". The videos found are in Hungarian.'
    }
  };

  MB.enContent['diff-fourier/fourier'] = {
    title: 'Fourier series',
    lead: 'The Fourier series claims that a periodic function can be written as an infinite sum of sines and cosines. The coefficients are obtained by integration, because the trigonometric functions are orthogonal — just as the coordinates of a vector can be extracted by a scalar product.',
    summary: 'Orthogonality of the trigonometric system, Fourier coefficients, even/odd simplification, Dirichlet convergence and the Parseval identity.',
    why: [
      R`The trigonometric system is orthogonal: $\int_{-\pi}^{\pi}\sin(mx)\sin(nx)dx=0$ if $m\neq n$. This is exactly the same property as for perpendicular basis vectors: if a vector is written as a sum of basis vectors, the coefficient is obtained by a scalar product. Here the integral plays the role of the scalar product, which is why $b_n=\frac1\pi\int f(x)\sin(nx)dx$.`,
      R`Convergence of the series is not automatic, but Dirichlet's theorem is reassuring: for a piecewise smooth function the Fourier series tends to the function value at every point, and at jump points to the average of the one-sided limits. This is why the series of the square wave with values $\pm1$ gives $0$ at the jump, not $1$ or $-1$.`,
      'Its practical strength lies in the fact that sines are the eigenfunctions of linear, shift-invariant systems: a sine input produces a sine output, with only the amplitude and phase changed. This is why a signal can be decomposed into harmonic components and each of them handled separately — this is the basis of signal processing, heat conduction and image compression.'
    ],
    when: 'In the analysis of periodic signals (sound, alternating current, carrier wave), in solving the heat and wave equations, in the separation of variables for partial differential equations. On the ZH (midterm) the typical task is to compute the coefficients of a square wave or of $f(x)=x$, to give the value of the convergence at a jump point, or to use even/odd simplification.',
    theory: [
      { title: 'Periodic function and trigonometric system', body: R`The function $f$ is $2\pi$-periodic if $f(x+2\pi)=f(x)$ for every $x$. The elements of the trigonometric system are $1,\cos x,\sin x,\cos2x,\sin2x,\dots$; these are orthogonal to each other with respect to the integral over the interval $[-\pi,\pi]$.` },
      { title: 'Orthogonality', body: R`$$ \begin{aligned}
\int_{-\pi}^{\pi}\cos(mx)\cos(nx)\,dx&=\begin{cases}0,&m\neq n,\\ \pi,&m=n\neq0,\end{cases}\\
\int_{-\pi}^{\pi}\sin(mx)\sin(nx)\,dx&=\begin{cases}0,&m\neq n,\\ \pi,&m=n\neq0,\end{cases}\\
\int_{-\pi}^{\pi}\cos(mx)\sin(nx)\,dx&=0.
\end{aligned} $$`, note: R`The integral of the constant function 1 is $2\pi$, which is why $a_0$ gets the factor of two.` },
      { title: 'Fourier coefficients and the series' },
      { title: 'Even and odd simplification', body: R`If $f$ is even ($f(-x)=f(x)$), then $f(x)\sin(nx)$ is odd, so $b_n=0$: only cosines remain (cosine series). If $f$ is odd, then $f(x)\cos(nx)$ and $f$ are both odd, so $a_n=0$ and $a_0=0$: only sines remain. This means doing half the work, so it is worth checking the symmetry first.` },
      { title: 'Dirichlet theorem (convergence)', body: R`If $f$ is $2\pi$-periodic and piecewise continuously differentiable, then its Fourier series converges at every point, namely
$$\frac{a_0}{2}+\sum_{n=1}^\infty\left(a_n\cos nx+b_n\sin nx\right)=\frac{f(x^+)+f(x^-)}{2}.$$
At a continuity point this is $f(x)$; at a jump point it is the average of the one-sided limits.` },
      { title: 'General period $2L$' },
      { title: 'Parseval identity', note: 'This is the “Pythagorean theorem” in function space: the energy of the signal is the sum of squares of the coefficients.' },
      { title: 'Where we meet it', items: [
        R`Signal processing: it decomposes sound into frequency components.`,
        R`Heat conduction: expanding the initial temperature profile into sines makes diffusion easy to compute.`,
        R`Electrical engineering: harmonics of a non-sinusoidal signal.`,
        R`Image compression: dropping coefficients of the Fourier (or cosine) transform.`
      ] }
    ],
    examples: [
      {
        title: 'Fourier series of a square wave',
        problem: R`Let $f(x)=-1$ on the interval $(-\pi,0)$ and $f(x)=1$ on the interval $(0,\pi)$, extended $2\pi$-periodically. Determine its Fourier series.`,
        steps: [
          R`$f$ is odd, so $a_0=0$ and every $a_n=0$; only $b_n$ remains.`,
          R`$b_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\sin(nx)dx=\frac2\pi\int_0^{\pi}\sin(nx)dx$.`,
          R`$\int_0^\pi\sin(nx)dx=\left[-\frac{\cos(nx)}{n}\right]_0^\pi=\frac{1-\cos(n\pi)}{n}=\frac{1-(-1)^n}{n}$.`,
          R`Therefore $b_n=\frac{2(1-(-1)^n)}{n\pi}$: $0$ for even $n$, $\frac{4}{n\pi}$ for odd $n$.`,
          R`The series: $f(x)\sim\frac4\pi\left(\sin x+\frac{\sin3x}{3}+\frac{\sin5x}{5}+\cdots\right)$.`
        ],
        answer: R`$f(x)\sim\dfrac4\pi\displaystyle\sum_{k=0}^{\infty}\frac{\sin((2k+1)x)}{2k+1}$`
      },
      {
        title: 'The expansion of $f(x)=x$',
        problem: R`Determine the Fourier series of the function $f(x)=x$ on the interval $(-\pi,\pi)$.`,
        steps: [
          R`$f$ is odd, so $a_0=0$ and $a_n=0$.`,
          R`$b_n=\frac1\pi\int_{-\pi}^{\pi}x\sin(nx)dx=\frac2\pi\int_0^{\pi}x\sin(nx)dx$.`,
          R`Integration by parts: $\int_0^\pi x\sin(nx)dx=\left[-\frac{x\cos(nx)}{n}\right]_0^\pi+\frac1n\int_0^\pi\cos(nx)dx=-\frac{\pi(-1)^n}{n}+0$.`,
          R`Thus $b_n=\frac2\pi\cdot\frac{\pi(-1)^{n+1}}{n}=\frac{2(-1)^{n+1}}{n}$.`,
          R`The series: $x\sim2\left(\sin x-\frac{\sin2x}{2}+\frac{\sin3x}{3}-\cdots\right)$ on the interval $(-\pi,\pi)$.`
        ],
        answer: R`$x\sim2\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}\sin(nx)$`
      },
      {
        title: 'Convergence at a jump point and a famous sum',
        problem: R`What does the Fourier series of the square wave give at $x=0$ and at $x=\frac{\pi}{2}$?`,
        steps: [
          R`$x=0$ is a jump point: the left-hand limit is $-1$, the right-hand limit is $+1$, so the value of the series is $\frac{-1+1}{2}=0$. This agrees with the fact that every term is $\sin0=0$.`,
          R`$x=\frac{\pi}{2}$ is a continuity point where $f=1$, so the series must tend to $1$.`,
          R`Substituting: $\frac4\pi\left(1-\frac13+\frac15-\frac17+\cdots\right)=1$.`,
          R`Rearranging: $1-\frac13+\frac15-\cdots=\frac{\pi}{4}$, which is the Leibniz series. The Fourier series can therefore also be used to evaluate numerical sums.`
        ],
        answer: R`$0$ at $x=0$, $1$ at $x=\frac\pi2$; hence $\frac\pi4=1-\frac13+\frac15-\cdots$`
      }
    ],
    mistakes: [
      R`At a jump point writing the function value as the limit of the series; correctly it is the average of the one-sided limits.`,
      R`Forgetting the factor $2$ in front of $a_0$: the series contains $a_0/2$, not $a_0$.`,
      R`For an odd function also computing cosine terms — they are automatically zero.`,
      R`For period $2L$, omitting the factor $\frac1L$ and the argument $\frac{n\pi x}{L}$.`
    ],
    exercises: [
      { q: R`What is the coefficient $a_0$ of the function $f(x)=x$ on the interval $(-\pi,\pi)$?`, hint: R`The integral of an odd function over a symmetric interval.`, sol: R`$a_0=\frac1\pi\int_{-\pi}^{\pi}x\,dx=0$.` },
      { q: R`What is the coefficient $b_1$ of the square wave above?`, hint: R`$b_1=\frac{2(1-\cos\pi)}{\pi}$.`, sol: R`$b_1=\frac{2(1-(-1))}{\pi}=\frac4\pi$.` },
      { q: R`In the Fourier series of an even function, which coefficients are zero?`, sol: R`For even $f$, $f(x)\sin(nx)$ is odd, so $b_n=0$: only cosine terms remain.`, choices: ['The coefficients $a_n$', 'The coefficients $b_n$', 'Neither'] },
      { q: R`What is the value of the Fourier series of the square wave at $x=\frac{\pi}{2}$?`, hint: R`There the function is continuous, with value $1$.`, sol: R`At a continuity point the series gives the function value: $1$.` },
      { q: R`What is the coefficient $a_1$ of the function $f(x)=x$?`, hint: R`Odd function.`, sol: R`$a_1=\frac1\pi\int_{-\pi}^{\pi}x\cos x\,dx=0$, because the integrand is odd.` },
      { q: R`What is the value of the Fourier series of the square wave at the jump point $x=0$?`, hint: R`The average of the one-sided limits.`, sol: R`$\frac{-1+1}{2}=0$.` },
      { q: R`Prove that $b_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\sin(nx)dx$, using the orthogonality of the trigonometric system.`, sol: R`Write the series in the form $f(x)=\frac{a_0}{2}+\sum_k(a_k\cos kx+b_k\sin kx)$, multiply by $\sin(nx)$, and integrate term by term over $[-\pi,\pi]$. By orthogonality every term is zero except the term $b_n\sin(nx)$, whose integral is $b_n\pi$. Thus $\int_{-\pi}^{\pi}f(x)\sin(nx)dx=b_n\pi$, from which $b_n$ follows.` },
      { q: R`Applying the Parseval identity to the square wave, what is $\displaystyle\sum_{k=1}^{\infty}\frac{1}{(2k-1)^2}$?`, hint: R`$\frac1\pi\int f^2=2$, and $\sum b_n^2=\frac{16}{\pi^2}\sum_{\text{odd}}\frac1{n^2}$.`, sol: R`$\frac1\pi\int_{-\pi}^{\pi}f^2dx=\frac{2\pi}{\pi}=2$. On the other hand $\sum b_n^2=\frac{16}{\pi^2}\sum_{k\ge1}\frac{1}{(2k-1)^2}$. Hence $\sum\frac{1}{(2k-1)^2}=\frac{2\pi^2}{16}=\frac{\pi^2}{8}$.` }
    ],
    video: {
      title: 'But what is the Fourier Transform?',
      channel: '3Blue1Brown'
    }
  };
})();
