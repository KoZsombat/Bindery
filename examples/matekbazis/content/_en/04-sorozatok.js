(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['sorozatok/sorozat-konvergencia'] = {
    title: 'Convergence, boundedness, monotonicity',
    lead: R`$a_n\to A$ means that every sufficiently large term of the sequence falls into any neighbourhood of $A$, however small. The definition does not "approach" the limit: it prescribes a radius $\varepsilon$ and demands that from some point on every term lies inside it.`,
    summary: 'The ε–N definition, uniqueness of the limit, boundedness, the limit laws, subsequences and Bolzano–Weierstrass, plus the difference between bounded and convergent.',
    why: [
      R`The $\varepsilon$–$N$ definition reverses ordinary thinking: we do not say that the terms "get closer and closer", but that however small a distance $\varepsilon$ we choose, there is a threshold index after which no term lies outside the interval $(A-\varepsilon,A+\varepsilon)$. The order matters: $\varepsilon$ comes first (the challenger), and only then do we answer with an $N$. This dependence is the basic pattern of all of analysis.`,
      R`Convergence implies two strong properties that we use in estimates: the limit is unique and the sequence is bounded. Neither converse holds: $(-1)^n$ is bounded but not convergent; monotonicity together with boundedness, however, is already sufficient (this is used in 4.3). Subsequences give the fastest divergence proof: if two subsequences tend to different limits, the sequence cannot be convergent.`
    ],
    when: R`Bring out the definition when a limit has to be proved, or when the problem asks for an $\varepsilon$ or an $N$. In practice most limits are computed with the limit laws and the squeeze theorem (4.2), but their validity rests on the definition. The monotone–bounded theorem is the standard tool for recursive sequences and for the convergence of numerical methods.`,
    theory: [
      { title: R`Convergence, the $\varepsilon$–$N$ definition`, body: R`The sequence $(a_n)$ is convergent with limit $A$ if for every $\varepsilon>0$ there exists $N\in\mathbb N$ such that for every $n>N$ we have $|a_n-A|<\varepsilon$. Notation: $\lim_{n\to\infty}a_n=A$, or $a_n\to A$. If no such $A$ exists, the sequence is divergent.` },
      { title: 'The limit is unique', body: R`If $a_n\to A$ and $a_n\to B$, then $A=B$. Proof: if $A\neq B$, let $\varepsilon=\frac{|A-B|}{2}>0$. By convergence, for large enough $n$ we have $|a_n-A|<\varepsilon$ and $|a_n-B|<\varepsilon$, hence $|A-B|\le|A-a_n|+|a_n-B|<2\varepsilon=|A-B|$, a contradiction.` },
      { title: 'Boundedness', body: R`The sequence $(a_n)$ is bounded above if there exists $K$ such that $a_n\le K$ for every $n$; bounded below if there exists $k$ such that $a_n\ge k$; bounded if both hold, that is, if there exists $M$ such that $|a_n|\le M$ for every $n$.` },
      { title: R`Convergent $\Rightarrow$ bounded`, body: R`Every convergent sequence is bounded. Proof: for $\varepsilon=1$ there is an $N$ such that $|a_n-A|<1$ whenever $n>N$, hence $|a_n|<|A|+1$. Taking the maximum of the finitely many initial terms ($a_1,\dots,a_N$), $M=\max\{|a_1|,\dots,|a_N|,|A|+1\}$ is a valid bound. The converse is false: $(-1)^n$ is bounded but divergent.` },
      { title: 'Operations with limits', note: R`The hypotheses: both sequences are convergent. For the quotient, $b_n\neq0$ also holds for large enough $n$, because $B\neq0$.` },
      { title: 'Subsequences and the tool for divergence', body: R`If $a_n\to A$, then every subsequence also tends to $A$. Consequence: if two subsequences tend to different limits, the sequence is divergent. For example, for $(-1)^n$ we have $a_{2n}=1\to1$ and $a_{2n-1}=-1\to-1$, so the sequence is not convergent.` },
      { title: 'Bolzano–Weierstrass theorem', body: R`Every bounded sequence has a convergent subsequence. This is one form of the completeness of the real numbers: a bounded sequence has an accumulation point, and from it a subsequence can be selected.` },
      { title: R`The definition is not an "approximation"`, body: R`The inequality $|a_n-A|<\varepsilon$ is required only for large enough $n$, not for every $n$, and $N$ may depend on $\varepsilon$. It is also fine if the sequence takes the limit value infinitely many times or jumps over it — only the fact that every term from some index on is close matters. This is why $(-1)^n/n$ is convergent even though it changes sign.` }
    ],
    examples: [
      {
        title: 'A limit from the definition',
        problem: R`Prove from the definition that $\lim_{n\to\infty}\dfrac1n=0$.`,
        steps: [
          R`Let $\varepsilon>0$ be arbitrary. We need $\left|\frac1n-0\right|=\frac1n<\varepsilon$.`,
          R`This holds exactly when $n>\frac1\varepsilon$.`,
          R`So choose the integer $N=\left\lceil\frac1\varepsilon\right\rceil$.`,
          R`If $n>N$, then $n>\frac1\varepsilon$, hence $\frac1n<\varepsilon$, that is $|a_n-0|<\varepsilon$.`,
          R`Since $\varepsilon>0$ was arbitrary, the definition holds.`
        ],
        answer: R`$\lim\frac1n=0$, with the choice $N=\lceil1/\varepsilon\rceil$`
      },
      {
        title: 'Using the limit laws',
        problem: R`Compute: $\lim_{n\to\infty}\dfrac{2n+1}{n}$.`,
        steps: [
          R`Rewrite: $\frac{2n+1}{n}=2+\frac1n$.`,
          R`The limit of a constant sequence is the constant itself: $2\to2$.`,
          R`$\frac1n\to0$ by the previous example.`,
          R`By the sum rule the limit is $2+0=2$.`
        ],
        answer: R`$2$`
      },
      {
        title: 'Divergence via subsequences',
        problem: R`Show that the sequence $a_n=(-1)^n$ is divergent.`,
        steps: [
          R`Consider the even-indexed subsequence: $a_{2n}=(-1)^{2n}=1$, which is constant, so its limit is $1$.`,
          R`The odd-indexed subsequence: $a_{2n-1}=(-1)^{2n-1}=-1$, with limit $-1$.`,
          R`If the sequence were convergent to $A$, every subsequence would tend to $A$.`,
          R`But $1\neq-1$, a contradiction, so the sequence is divergent.`
        ],
        answer: R`Divergent (the two subsequences have different limits)`
      }
    ],
    mistakes: [
      R`Swapping the order of the quantifiers in the definition: choosing $N$ before $\varepsilon$. The $N$ always depends on $\varepsilon$.`,
      R`Believing that boundedness is sufficient for convergence: $(-1)^n$ is a counterexample.`,
      R`Taking monotonicity alone to be convergence: $a_n=n$ is increasing but divergent.`,
      R`Inferring the convergence of the whole sequence from the convergence of a single subsequence.`
    ],
    exercises: [
      { q: R`What is $\lim_{n\to\infty}\dfrac{n}{n+1}$?`, hint: R`Divide both the numerator and the denominator by $n$.`, sol: R`$\frac{n}{n+1}=\frac{1}{1+1/n}\to\frac{1}{1+0}=1$.` },
      { q: R`For the sequence $a_n=\frac1n$, give the smallest threshold index $N$ such that $|a_n|<\varepsilon$ whenever $n>N$, for $\varepsilon=0{,}01$.`, hint: R`$\frac1n<0{,}01\iff n>100$. Careful: $n>N$, not $n\ge N$.`, sol: R`$n>100$ is necessary, so $N=100$; then $n\ge101$ and $\frac1{101}<0{,}01$. $N=99$ does not work, because for $n=100$ we get $\frac1{100}=0{,}01$, which is not strictly smaller.` },
      { q: R`What is $\lim_{n\to\infty}\dfrac{(-1)^n}{n}$?`, hint: R`Estimate from above in absolute value: $\left|\frac{(-1)^n}{n}\right|=\frac1n$.`, sol: R`$0\le\left|\frac{(-1)^n}{n}\right|=\frac1n\to0$, so the sequence tends to $0$.` },
      { q: R`Give the least upper bound (supremum) of the sequence $a_n=\frac{n}{n+1}$.`, hint: R`$a_n=1-\frac1{n+1}<1$, and the limit is $1$.`, sol: R`The sequence is strictly increasing and tends to $1$, so $\sup a_n=1$ (a value it never attains).` },
      { q: R`For the sequence $a_n=\frac{2n+1}{n}$, what is the smallest $N$ such that $|a_n-2|<0{,}1$ whenever $n>N$?`, hint: R`$|a_n-2|=\frac1n<0{,}1\iff n>10$.`, sol: R`$n>10$, so $N=10$; then $n\ge11$ and $\frac1{11}<0{,}1$.` },
      { q: R`Prove that every convergent sequence is bounded.`, hint: R`Use the definition with $\varepsilon=1$, then include the finitely many initial terms in a maximum.`, sol: R`If $a_n\to A$, then for $\varepsilon=1$ there is an $N$ such that $|a_n|<|A|+1$ whenever $n>N$. Let $M=\max\{|a_1|,\dots,|a_N|,|A|+1\}$. Then $|a_n|\le M$ for every $n$, so the sequence is bounded.` },
      { q: R`We know about the sequence $(a_n)$ that $a_{2n}\to1$ and $a_{2n+1}\to2$. Is the sequence convergent?`, choices: ['Yes, its limit is $1$', 'Yes, its limit is $2$', 'Not convergent', 'This data is not enough to decide'], hint: R`If it were convergent, every subsequence would tend to the same limit.`, sol: R`Two subsequences tend to different limits, so the sequence is not convergent.` },
      { q: R`What is $\lim_{n\to\infty}\dfrac{n+1}{2n}$?`, hint: R`Divide the numerator and the denominator by $n$.`, sol: R`$\frac{1+1/n}{2}\to\frac12$.` }
    ],
    video: { title: 'Limits, monotonicity and boundedness of sequences', channel: 'Felsőfok', note: 'Video lecture on the ε–N definition and the monotone–bounded theorem.' }
  };

  MB.enContent['sorozatok/sorozat-limitszamitas'] = {
    title: 'Computing limits',
    lead: R`Limits are not computed from the definition but by rewriting: factoring out the dominant term, multiplying a root expression by its conjugate, or squeezing between a smaller and a larger sequence. The goal is always to bring the expression into a form where the limit laws are visibly applicable.`,
    summary: 'Three polynomial cases, root differences, the squeeze theorem, orders of growth and standard limits.',
    why: [
      R`At infinity the value of a quotient is decided by which term in the numerator and the denominator grows fastest. If we factor out the dominant power, the remaining terms are powers of $1/n$, which tend to zero. Hence the limit of a rational function splits into three cases: if the degree of the numerator is smaller, the limit is $0$; if the degrees are equal, it is the ratio of the leading coefficients; if the numerator has larger degree, the sequence tends to $\pm\infty$. There is no need to memorise separate rules, only to carry out the factoring.`,
      R`The root difference $\sqrt{n+4}-\sqrt n$ looks like $\infty-\infty$, which is indeterminate. Multiplying by the conjugate gives a finite denominator: the difference equals $\frac{4}{\sqrt{n+4}+\sqrt n}$, which tends to zero. This is the same trick as the extension used in complex division. The squeeze theorem is needed when the sequence oscillates but stays in absolute value below a null sequence, as with $\frac{\sin n}{n}$.`
    ],
    when: R`The limit problems of the ZH (in-class test) rely almost without exception on these tools. For rational fractions factoring out the dominant term is always the first step. For a root difference, multiply by the conjugate. For an oscillating but bounded factor ($\sin$, $\cos$, $(-1)^n$), use the squeeze theorem. For exponential and factorial expressions the order-of-growth list in 4.3 decides.`,
    theory: [
      { title: 'Limit of a rational function', note: R`The method is always the same: factor out the highest power from both the numerator and the denominator.` },
      { title: 'The factoring in concrete terms', body: R`$\dfrac{4n^3-2n+7}{5n^3+8n^2-1}=\dfrac{n^3\left(4-\frac2{n^2}+\frac7{n^3}\right)}{n^3\left(5+\frac8n-\frac1{n^3}\right)}=\dfrac{4-\frac2{n^2}+\frac7{n^3}}{5+\frac8n-\frac1{n^3}}\to\dfrac45$. The $n^3$ cancels because the numerator and the denominator have the same degree.` },
      { title: 'Extending a root difference', note: R`The extension is based on the identity $\sqrt A-\sqrt B=\frac{A-B}{\sqrt A+\sqrt B}$.` },
      { title: 'Squeeze theorem (sandwich theorem)', note: R`A frequent application: $0\le\frac{|\sin n|}{n}\le\frac1n\to0$.` },
      { title: 'Orders of growth', note: R`That is, $\frac{n^k}{a^n}\to0$, $\frac{a^n}{n!}\to0$, $\frac{n!}{n^n}\to0$.` },
      { title: 'Stolz–Cesàro theorem', body: R`If $(b_n)$ is strictly increasing and $b_n\to\infty$, and $\dfrac{a_{n+1}-a_n}{b_{n+1}-b_n}\to L$, then $\dfrac{a_n}{b_n}\to L$ as well. This is the "L'Hôpital" of quotient limits, for sequences.` },
      { title: R`$\infty-\infty$ and $\infty/\infty$`, body: R`The limit must not be taken term by term: for $\sqrt{n+4}-\sqrt n$ this gives $\infty-\infty$, which is indeterminate. Likewise, for $\frac{4n^3+\dots}{5n^3+\dots}$ the form $\frac\infty\infty$ is not an answer but a reason to rewrite the expression. A term-by-term limit is valid only when the operation does not produce an indeterminate form.` }
    ],
    examples: [
      {
        title: 'A rational function via the dominant term',
        problem: R`Compute: $\lim_{n\to\infty}\dfrac{4n^3-2n+7}{5n^3+8n^2-1}$.`,
        steps: [
          R`Both polynomials have degree $3$, so factor out $n^3$ from the numerator and from the denominator.`,
          R`Numerator: $n^3\left(4-\frac2{n^2}+\frac7{n^3}\right)$.`,
          R`Denominator: $n^3\left(5+\frac8n-\frac1{n^3}\right)$.`,
          R`The $n^3$ cancels, and the remaining terms (powers of $\frac1n$) tend to zero.`,
          R`The limit is the ratio of the leading coefficients: $\frac45$.`
        ],
        answer: R`$\dfrac45$`
      },
      {
        title: 'A root difference',
        problem: R`Compute: $\lim_{n\to\infty}\left(\sqrt{n+4}-\sqrt n\right)$.`,
        steps: [
          R`This is of the form $\infty-\infty$, so multiply by the conjugate: $\frac{(\sqrt{n+4}-\sqrt n)(\sqrt{n+4}+\sqrt n)}{\sqrt{n+4}+\sqrt n}$.`,
          R`The numerator is $(n+4)-n=4$.`,
          R`So the expression is $\frac{4}{\sqrt{n+4}+\sqrt n}$.`,
          R`The denominator tends to $\infty$, so the fraction tends to $0$.`
        ],
        answer: R`$0$`
      },
      {
        title: 'Squeeze theorem with an oscillating factor',
        problem: R`Compute: $\lim_{n\to\infty}\dfrac{\sin n}{n}$.`,
        steps: [
          R`For every $n$, $-1\le\sin n\le1$.`,
          R`Hence $-\frac1n\le\frac{\sin n}{n}\le\frac1n$ (dividing by the positive $n$).`,
          R`Both bounding sequences tend to $0$: $-\frac1n\to0$ and $\frac1n\to0$.`,
          R`By the squeeze theorem the sequence in between also tends to $0$.`
        ],
        answer: R`$0$`
      },
      {
        title: 'A sum of exponentials under a root',
        problem: R`Compute: $\lim_{n\to\infty}\sqrt[n]{2^n+3^n}$.`,
        steps: [
          R`Factor out the larger base: $2^n+3^n=3^n\left(\left(\frac23\right)^n+1\right)$.`,
          R`Taking the $n$-th root: $\sqrt[n]{3^n}\cdot\sqrt[n]{\left(\frac23\right)^n+1}=3\cdot\sqrt[n]{\left(\frac23\right)^n+1}$.`,
          R`$\left(\frac23\right)^n\to0$, so the expression under the root tends to $1$.`,
          R`More precisely, $1\le\left(\frac23\right)^n+1\le2$, hence $1\le\sqrt[n]{\left(\frac23\right)^n+1}\le\sqrt[n]{2}\to1$; by the squeeze theorem the limit of the root is $1$.`,
          R`The limit is $3$.`
        ],
        answer: R`$3$`
      }
    ],
    mistakes: [
      R`Looking only at the highest-degree terms of a rational function and dropping the rest without justification — the correct step is factoring.`,
      R`Taking $\infty-\infty$ to be $0$: $\sqrt{n+4}-\sqrt n\to0$, but $\sqrt{n^2+n}-n\to\frac12$, so there is no general rule.`,
      R`Using the squeeze theorem in the wrong direction: both bounds must tend to the same $L$.`,
      R`Writing that $\sin n\to0$ in $\frac{\sin n}{n}$ — $\sin n$ does not tend anywhere, it is only bounded.`
    ],
    exercises: [
      { q: R`What is $\lim_{n\to\infty}\dfrac{3n^2-n}{n^2+2}$?`, hint: R`Equal degree: take the ratio of the leading coefficients.`, sol: R`Dividing by $n^2$: $\frac{3-1/n}{1+2/n^2}\to3$.` },
      { q: R`What is $\lim_{n\to\infty}\dfrac{2n+5}{4n-1}$?`, hint: R`Both are linear.`, sol: R`$\frac{2+5/n}{4-1/n}\to\frac24=\frac12$.` },
      { q: R`What is $\lim_{n\to\infty}\left(\sqrt{n^2+n}-n\right)$?`, hint: R`Multiply by the conjugate: $\frac{n}{\sqrt{n^2+n}+n}$.`, sol: R`$\frac{n}{n\sqrt{1+1/n}+n}=\frac{1}{\sqrt{1+1/n}+1}\to\frac12$.` },
      { q: R`What is the limit $\lim_{n\to\infty}\dfrac{n^3+1}{n^2+1}$?`, hint: R`The numerator has higher degree than the denominator.`, sol: R`$\frac{n^3+1}{n^2+1}=n\cdot\frac{1+1/n^3}{1+1/n^2}\to\infty$.`, altEn: ['+infinity', 'infinity', 'infinite', 'diverges', 'tends to infinity'] },
      { q: R`What is $\lim_{n\to\infty}\dfrac{n!}{n^n}$?`, hint: R`$\frac{n!}{n^n}=\frac1n\cdot\frac2n\cdots\frac nn\le\frac1n$.`, sol: R`Every factor is at most $1$, so $0<\frac{n!}{n^n}\le\frac1n\to0$; by the squeeze theorem the limit is $0$.` },
      { q: R`What is $\lim_{n\to\infty}\sqrt[n]{3^n+4^n}$?`, hint: R`Factor out $4^n$.`, sol: R`$4\cdot\sqrt[n]{(3/4)^n+1}\to4\cdot1=4$.` },
      { q: R`Prove: if $a_n\to0$ and $(b_n)$ is bounded, then $a_nb_n\to0$.`, hint: R`Use the bound $|b_n|\le M$ and the squeeze theorem.`, sol: R`Let $|b_n|\le M$. Then $0\le|a_nb_n|\le M|a_n|$. Since $M|a_n|\to0$, the squeeze theorem gives $|a_nb_n|\to0$, hence $a_nb_n\to0$.` },
      { q: R`What is $\lim_{n\to\infty}\sqrt n\left(\sqrt{n+1}-\sqrt n\right)$?`, hint: R`First multiply by the conjugate, then multiply by $\sqrt n$.`, sol: R`$\sqrt{n+1}-\sqrt n=\frac1{\sqrt{n+1}+\sqrt n}$, so the product is $\frac{\sqrt n}{\sqrt{n+1}+\sqrt n}=\frac{1}{\sqrt{1+1/n}+1}\to\frac12$.` }
    ],
    video: { title: 'Computing limits of sequences', channel: 'Hungarian mathematics channels', note: 'Search for worked examples of rational, root and squeeze-theorem limits.' }
  };

  MB.enContent['sorozatok/sorozat-nevezetes'] = {
    title: 'Standard limits and recurrences',
    lead: R`Some limits are worth knowing by heart because they recur as building blocks in other problems: $\left(1+\frac xn\right)^n\to e^x$, $\sqrt[n]{n}\to1$, $\frac{n^k}{a^n}\to0$. For recursively defined sequences the task is not to guess a formula but to prove monotonicity and boundedness, then write down an equation for the limit.`,
    summary: 'e and exponential limits, monotone bounded sequences, recursive fixed points, limsup and liminf.',
    why: [
      R`The sequence $\left(1+\frac1n\right)^n$ does not converge to $e$ by accident: this is one possible definition of $e$, and all properties of $e^x$ follow from it. The $x$ in the exponent is only a scaling: $\left(1+\frac xn\right)^n=\left[\left(1+\frac xn\right)^{n/x}\right]^x\to e^x$. This is why continuous compound interest, the derivative of the logarithm and the derivative of the exponential function are all consequences of the same limit.`,
      R`For recursive sequences the fixed-point equation ($L=f(L)$) only says what the limit could be, not that it exists. Hence the correct order is: first monotonicity and boundedness (which give convergence by the monotone–bounded theorem), and only then the solution of the fixed-point equation. Monotonicity is usually proved by induction, and the bound is guessed from the candidate limit.`
    ],
    when: R`Standard limits are needed when the expression has an exponential or root form: $\left(1+\frac cn\right)^n$, $\sqrt[n]{n^k+3}$, $\frac{n^{10}}{2^n}$. For a recursive sequence (for example $a_{n+1}=\sqrt{2+a_n}$, $a_{n+1}=7-\frac{10}{a_n}$) the monotone–bounded theorem is the standard route. Limsup/liminf are useful when the sequence is not convergent but we want to describe its behaviour.`,
    theory: [
      { title: R`The limit defining $e$ and its generalisation`, note: R`More generally: if $a_n\to0$, then $(1+a_n)^{1/a_n}\to e$; this yields the power definition of $e^x$.` },
      { title: 'Roots and powers', note: R`The rewriting $\sqrt[n]{n}=e^{\frac{\ln n}{n}}$ shows that the exponent tends to $0$.` },
      { title: 'Exponential beats polynomial', note: R`The order of growth: $\ln n\ll n^k\ll a^n\ll n!\ll n^n$.` },
      { title: 'Monotone–bounded theorem', body: R`If $(a_n)$ is monotonically increasing and bounded above, then it is convergent and its limit is $\sup\{a_n\}$. If it is monotonically decreasing and bounded below, then it is convergent with limit $\inf\{a_n\}$.` },
      { title: 'Limit of a recursive sequence', body: R`If $a_{n+1}=f(a_n)$ and $a_n\to L$, and $f$ is continuous, then $L=f(L)$. This gives an equation for $L$. But it is only a necessary condition: convergence must be proved first (monotonicity and boundedness), otherwise a spurious root may appear.` },
      { title: 'Limit superior and inferior', body: R`$\limsup_{n\to\infty}a_n=\lim_{n\to\infty}\left(\sup_{k\ge n}a_k\right)$ and $\liminf_{n\to\infty}a_n=\lim_{n\to\infty}\left(\inf_{k\ge n}a_k\right)$. These exist for every sequence in the extended real numbers, and $a_n$ is convergent exactly when $\liminf a_n=\limsup a_n$ (with a finite common value).` },
      { title: 'A fixed point is not enough', body: R`The sequence $a_1=2$, $a_{n+1}=a_n^2$ has the fixed points $0$ and $1$ ($L=L^2$), yet $a_n\to\infty$. The fixed-point equation alone is therefore misleading: convergence must be proved separately. Likewise, for $a_{n+1}=7-\frac{10}{a_n}$ there are two fixed points ($2$ and $5$), and only the initial value and the monotonicity decide which one becomes the limit.` },
      { title: 'Worth knowing by heart', items: [
        R`$\left(1+\frac1n\right)^n\to e\approx2{,}718$.`,
        R`$\sqrt[n]{n}\to1$ and $\sqrt[n]{c}\to1$ for every $c>0$.`,
        R`$\frac{n^k}{a^n}\to0$ ($a>1$), $\frac{a^n}{n!}\to0$, $\frac{n!}{n^n}\to0$.`,
        R`$\left(1-\frac1n\right)^n\to e^{-1}$; in general $\left(1+\frac xn\right)^n\to e^x$.`
      ] }
    ],
    examples: [
      {
        title: 'Limit of a recursive sequence',
        problem: R`Let $a_1=4$ and $a_{n+1}=7-\dfrac{10}{a_n}$. Show that the sequence is convergent and compute its limit.`,
        steps: [
          R`Conjecture: $a_n$ is increasing and smaller than $5$. By induction: $a_1=4<5$. If $2<a_n<5$, then $\frac{10}{a_n}\in(2,5)$, hence $a_{n+1}=7-\frac{10}{a_n}\in(2,5)$.`,
          R`Monotonicity: $a_{n+1}-a_n=7-\frac{10}{a_n}-a_n=\frac{-(a_n-2)(a_n-5)}{a_n}$. If $2<a_n<5$, then $(a_n-2)(a_n-5)<0$, so the difference is positive: the sequence is increasing.`,
          R`Increasing and bounded above ($a_n<5$), so by the monotone–bounded theorem it is convergent; let $L=\lim a_n$.`,
          R`Taking the limit in the recursion: $L=7-\frac{10}{L}$, that is $L^2-7L+10=0$.`,
          R`The roots are $L=2$ or $L=5$. Since $a_n\ge4$ for every $n$, the limit cannot be $2$, so $L=5$.`
        ],
        answer: R`$\lim a_n=5$`
      },
      {
        title: 'The $e$ limit with a scaling',
        problem: R`Compute: $\lim_{n\to\infty}\left(1+\dfrac2n\right)^n$.`,
        steps: [
          R`Rewrite the exponent: $\left(1+\frac2n\right)^n=\left[\left(1+\frac2n\right)^{n/2}\right]^2$.`,
          R`Let $m=\frac n2$; then the inner expression is $\left(1+\frac1m\right)^m\to e$.`,
          R`Squaring is continuous, so the limit is $e^2$.`,
          R`In general, $\left(1+\frac xn\right)^n\to e^x$.`
        ],
        answer: R`$e^2$`
      },
      {
        title: 'A square-root recursion',
        problem: R`Let $a_1=1$ and $a_{n+1}=\sqrt{2+a_n}$. Show that the sequence is convergent and give its limit.`,
        steps: [
          R`By induction: $a_1=1<2$. If $a_n<2$, then $a_{n+1}=\sqrt{2+a_n}<\sqrt4=2$, so the sequence is bounded above by $2$.`,
          R`Monotonicity: $a_{n+1}^2-a_n^2=(2+a_n)-a_n^2=-(a_n-2)(a_n+1)>0$ whenever $a_n<2$. Since $a_{n+1},a_n>0$, this gives $a_{n+1}>a_n$.`,
          R`Increasing and bounded, hence convergent; let $L=\lim a_n$.`,
          R`Taking the limit: $L=\sqrt{2+L}$, that is $L^2=2+L$.`,
          R`$L^2-L-2=0$, with roots $L=2$ and $L=-1$. Since $a_n>0$, $L=2$.`
        ],
        answer: R`$\lim a_n=2$`
      },
      {
        title: 'Limit superior and inferior',
        problem: R`Determine $\limsup$ and $\liminf$ of the sequence $a_n=(-1)^n+\dfrac1n$.`,
        steps: [
          R`For even $n$: $a_{2n}=1+\frac1{2n}\to1$.`,
          R`For odd $n$: $a_{2n-1}=-1+\frac1{2n-1}\to-1$.`,
          R`The accumulation points of the sequence are $-1$ and $1$ (these are the limits of the subsequences), so $\limsup a_n=1$ and $\liminf a_n=-1$.`,
          R`Since the two differ, the sequence is not convergent.`
        ],
        answer: R`$\limsup a_n=1$, $\liminf a_n=-1$`
      }
    ],
    mistakes: [
      R`Writing down the fixed-point equation before proving convergence of a recursive sequence — this can produce a spurious root.`,
      R`Writing $2e$ instead of $e^2$ for $\left(1+\frac2n\right)^n$: the exponent contains $n$, not $2n$.`,
      R`Writing $\sqrt[n]{n}\to0$ instead of $\sqrt[n]{n}\to1$.`,
      R`Believing that $\frac{n^k}{a^n}$ tends to zero only for $k=1$; it holds for every fixed $k>0$.`
    ],
    exercises: [
      { q: R`What is $\lim_{n\to\infty}\left(1+\dfrac3n\right)^n$?`, hint: R`$\left(1+\frac xn\right)^n\to e^x$.`, sol: R`Here $x=3$, so the limit is $e^3$.` },
      { q: R`What is $\lim_{n\to\infty}\sqrt[n]{n}$?`, hint: R`Rewrite it in the form $e^{\ln n/n}$.`, sol: R`$\sqrt[n]{n}=e^{\frac{\ln n}{n}}$, and $\frac{\ln n}{n}\to0$, so the limit is $e^0=1$.` },
      { q: R`What is $\lim_{n\to\infty}\left(1+\dfrac1n\right)^{2n}$?`, hint: R`$\left(1+\frac1n\right)^{2n}=\left[\left(1+\frac1n\right)^n\right]^2$.`, sol: R`The inner sequence tends to $e$, so its square tends to $e^2$.` },
      { q: R`What is $\lim_{n\to\infty}\dfrac{2^n}{n!}$?`, hint: R`$n!$ grows faster than any exponential.`, sol: R`By the order-of-growth list $a^n\ll n!$, so the quotient tends to $0$.` },
      { q: R`Let $a_1=1$ and $a_{n+1}=\dfrac{a_n+2}{2}$. What is the limit?`, hint: R`Fixed point: $L=\frac{L+2}{2}$; but check monotonicity first.`, sol: R`The closed form is $a_n=2-\frac1{2^{n-1}}$, so $a_n\to2$. Check: $L=\frac{L+2}{2}\Rightarrow L=2$.` },
      { q: R`Let $a_1=1$ and $a_{n+1}=1+\dfrac1{a_n}$. What is the limit?`, hint: R`The fixed point: $L=1+\frac1L$, that is $L^2-L-1=0$.`, sol: R`The sequence is bounded ($1\le a_n\le2$) and convergent; $L=1+\frac1L\Rightarrow L^2-L-1=0\Rightarrow L=\frac{1+\sqrt5}{2}$ (the negative root is not admissible).`, altEn: ['golden ratio', 'phi'] },
      { q: R`What are the limit superior and the limit inferior of the sequence $a_n=(-1)^n+\frac1n$?`, hint: R`Look at the even and odd subsequences.`, sol: R`$a_{2n}\to1$, $a_{2n-1}\to-1$, so $\limsup=1$, $\liminf=-1$.`, altEn: ['limsup=1, liminf=-1', '1 and -1', 'limsup 1 liminf -1', '1, -1'] },
      { q: R`Prove that the sequence $a_1=2$, $a_{n+1}=\sqrt{2a_n}$ is convergent and has limit $2$.`, hint: R`Prove by induction that $a_n\ge2$ and $a_{n+1}\le a_n$; then solve $L=\sqrt{2L}$.`, sol: R`$a_1=2$, and if $a_n>0$, then $a_{n+1}=\sqrt{2a_n}$ is well defined. We show that $a_n\ge2$ and the sequence is decreasing: $a_{n+1}^2-a_n^2=2a_n-a_n^2=a_n(2-a_n)\le0$ whenever $a_n\ge2$, hence $a_{n+1}\le a_n$. Monotonically decreasing and bounded below, so it is convergent; $L=\sqrt{2L}\Rightarrow L^2=2L\Rightarrow L=2$ ($0$ is impossible because $a_n\ge2$).` }
    ],
    video: { title: 'Standard sequence limits and recursive sequences', channel: 'Hungarian mathematics channels', note: 'Search for the standard limits, e, and the monotone–bounded theorem applied to recursions.' }
  };
})();
