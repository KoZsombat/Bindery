(function () {
  const MB = window.MB;
  MB.enContent = MB.enContent || {};

  MB.enContent['alapok/algebra'] = {
    title: 'Powers, roots, logarithms',
    lead: 'Exponentiation is repeated multiplication. Every other rule — the negative exponent, the fractional exponent, the logarithm — follows from this single idea; it does not have to be memorised.',
    why: [
      'Exponentiation is originally repeated multiplication: $x^3 = x \\cdot x \\cdot x$. If we multiply the same base, the number of factors adds up, hence $x^a x^b = x^{a+b}$. In a division the factors "cancel", hence $x^a/x^b = x^{a-b}$. The other rules are not new conventions but consequences of these two relations.',
      'The logarithm asks the same question backwards: "to what power must the base be raised to get this?". Therefore the logarithm identities are exactly the mirror images of the exponent rules. Once you feel this, you do not have to memorise them separately.'
    ],
    when: 'Before every limit, differentiation and integration problem. The most common mistake is not in the new material but in a bad exponent manipulation or in a forgotten domain. If you can bring an expression into a simpler form, the limit and the derivative will be simpler too.',
    theory: [
      {
        title: 'Powers and roots',
        body: 'The power $x^n$ means the product of $n$ copies of $x$ (if $n$ is a positive integer). Taking a root is its inverse: $\\sqrt[n]{x}$ is the nonnegative number whose $n$-th power is $x$. An odd root can be taken of a negative number too; an even root only of a nonnegative one.'
      },
      {
        title: 'Power rules',
        note: 'The fractional-exponent manipulation is only "safe" for a positive base; for a negative base the meaning of a real exponent changes.'
      },
      {
        title: 'Logarithm',
        body: '$\\log_a b = c$ means exactly that $a^c=b$, where $a>0$, $a\\neq 1$ and $b>0$. The natural logarithm has base $e\\approx 2{,}71828$ and is written $\\ln x$. The base-10 logarithm is written $\\lg x$ or $\\log_{10}x$.'
      },
      {
        title: 'Logarithm identities',
        note: 'Condition: $A>0$, $B>0$. If $A$ or $B$ can be negative, then $\\ln(x^2)=2\\ln|x|$, not $2\\ln x$.'
      },
      {
        title: 'Why $e$?',
        body: 'The number $e$ is not arbitrary: it is the limit of the sequence $(1+1/n)^n$. This is why $e^x$ is the only exponential function (apart from a constant factor) whose derivative is itself. That also makes it the natural base in computer science and in physics.'
      },
      {
        title: 'The most common trap',
        body: '$\\sqrt{x^2}=|x|$, not $x$. For example, for $x=-3$ we get $\\sqrt{9}=3$, not $-3$. Likewise $(a+b)^2\\neq a^2+b^2$ and $\\sqrt{a+b}\\neq\\sqrt a+\\sqrt b$. A fraction can be simplified only by a factor that has been turned into a product, never by a term.'
      },
      {
        title: 'Notable products'
      }
    ],
    examples: [
      {
        title: 'Combining fractional exponents',
        problem: 'Write as a single power ($x>0$): $\\dfrac{x^2\\cdot\\sqrt[3]{x}}{x^{-1}\\cdot\\sqrt{x}}$.',
        steps: [
          'Numerator: $x^2\\cdot x^{1/3}=x^{2+1/3}=x^{7/3}$.',
          'Denominator: $x^{-1}\\cdot x^{1/2}=x^{-1+1/2}=x^{-1/2}$.',
          'When dividing we subtract: $x^{7/3-(-1/2)}=x^{7/3+1/2}$.',
          'Common denominator: $7/3+1/2=14/6+3/6=17/6$.'
        ],
        answer: '$x^{17/6}$'
      },
      {
        title: 'Exponential equation',
        problem: 'Solve: $2^{3x-1}=5$.',
        steps: [
          'Take the base-2 logarithm of both sides: $3x-1=\\log_2 5$.',
          'Switch to the natural base: $\\log_2 5=\\dfrac{\\ln 5}{\\ln 2}$.',
          'Rearranging: $x=\\dfrac{1+\\log_2 5}{3}=\\dfrac{1+\\ln 5/\\ln 2}{3}\\approx 1{,}107$.'
        ],
        answer: '$x=\\dfrac{1+\\log_2 5}{3}\\approx 1{,}107$'
      },
      {
        title: 'Exponential equation by substitution',
        problem: 'Solve: $9^x-4\\cdot 3^x+3=0$.',
        steps: [
          'Introduce the substitution $t=3^x>0$. Then $9^x=(3^x)^2=t^2$.',
          'The equation becomes $t^2-4t+3=0$, that is $(t-1)(t-3)=0$.',
          'For $t=1$ we get $3^x=1$, hence $x=0$. For $t=3$ we get $3^x=3$, hence $x=1$.',
          'Both roots are valid, since $t>0$ holds.'
        ],
        answer: '$x=0$ or $x=1$'
      },
      {
        title: 'Logarithmic equation with domain',
        problem: 'Solve: $\\ln(x+2)+\\ln(x-1)=\\ln 4$.',
        steps: [
          'First the domain: $x+2>0$ and $x-1>0$, hence $x>1$.',
          'By the logarithm identity: $\\ln((x+2)(x-1))=\\ln 4$.',
          'The logarithm is strictly monotone, hence $(x+2)(x-1)=4$.',
          '$x^2+x-2=4$, that is $x^2+x-6=0$, with roots $x=2$ and $x=-3$.',
          '$-3$ does not satisfy $x>1$, so only $x=2$ is a solution.'
        ],
        answer: '$x=2$'
      }
    ],
    mistakes: [
      'Writing $\\sqrt{x^2}=x$ instead of $\\sqrt{x^2}=|x|$.',
      '$(a+b)^2=a^2+b^2$ — correctly $a^2+2ab+b^2$.',
      'Omitting the domain check in a logarithmic equation.',
      'Simplifying a fraction by a term: $\\frac{x^2-9}{x-3}=x+3$ only for $x\\neq 3$, and only because the numerator can be factored.'
    ],
    exercises: [
      {
        q: 'Write as a single power ($x>0$) and give the exponent: $\\dfrac{x^2\\cdot\\sqrt[3]{x}}{x^{-1}\\cdot\\sqrt{x}}$.',
        hint: 'Write every factor as a power of $x$: $\\sqrt[3]{x}=x^{1/3}$, $\\sqrt{x}=x^{1/2}$.',
        sol: 'Numerator: $x^{7/3}$; denominator: $x^{-1/2}$; quotient: $x^{7/3+1/2}=x^{17/6}$.'
      },
      {
        q: 'Solve: $\\ln(x+2)+\\ln(x-1)=\\ln 4$.',
        hint: 'First the domain: $x>1$. Then $\\ln((x+2)(x-1))=\\ln 4$.',
        sol: '$(x+2)(x-1)=4\\Rightarrow x^2+x-6=0\\Rightarrow x=2$ or $x=-3$. Only $x=2$ lies in the domain.'
      },
      {
        q: 'What is $\\cos(2\\pi/3)$?',
        hint: '$2\\pi/3=\\pi-\\pi/3$; in the second quadrant the cosine is negative.',
        sol: '$\\cos(2\\pi/3)=-\\cos(\\pi/3)=-1/2$.'
      },
      {
        q: 'Solve: $2^{3x-1}=5$. Give the exact value of $x$.',
        hint: 'Take the base-2 logarithm of both sides.',
        sol: '$3x-1=\\log_2 5\\Rightarrow x=(1+\\log_2 5)/3$.'
      },
      {
        q: 'Solve: $9^x-4\\cdot 3^x+3=0$. Give the larger root.',
        hint: 'Substitute $t=3^x>0$; $9^x=t^2$.',
        sol: '$t^2-4t+3=0\\Rightarrow t=1$ or $t=3$. Hence $x=0$ or $x=1$; the larger one is $1$.'
      },
      {
        q: 'Give the domain of the function $f(x)=\\dfrac{\\ln(x^2-5x+6)}{\\sqrt{4-x}}$.',
        hint: 'Two conditions: $x^2-5x+6>0$ and $4-x>0$.',
        sol: '$(x-2)(x-3)>0\\Rightarrow x<2$ or $x>3$; and $x<4$. Intersection: $(-\\infty,2)\\cup(3,4)$.',
        altEn: ['x<2 or 3<x<4']
      },
      {
        q: 'Solve: $|2x+1|\\ge 5$.',
        hint: 'Two cases: $2x+1\\ge 5$ or $2x+1\\le -5$.',
        sol: '$2x+1\\ge5\\Rightarrow x\\ge2$; $2x+1\\le-5\\Rightarrow x\\le-3$.',
        altEn: ['x<=-3 or x>=2']
      },
      {
        q: 'Is it true for every real $x$ that $\\sqrt{x^2}=x$?',
        choices: ['True', 'False'],
        sol: 'False. $\\sqrt{x^2}=|x|$; for example, for $x=-3$ we get $\\sqrt{9}=3\\neq-3$.'
      }
    ],
    video: {
      title: 'Powers, roots and logarithm basics',
      channel: 'Hungarian mathematics channels'
    }
  };

  MB.enContent['alapok/trigonometria'] = {
    title: 'Trigonometry and the unit circle',
    lead: 'At university every angle is in radians, and trigonometric functions are best seen not through triangles but as coordinates on the unit circle. That is what makes the signs, the period and the identities understandable.',
    why: [
      'On a circle of radius one centred at the origin, starting from the positive half of the $x$-axis, a turn by an angle $\\alpha$ gives the point with coordinates $(\\cos\\alpha,\\sin\\alpha)$. Since the point lies on the circle, $x^2+y^2=1$, hence $\\cos^2\\alpha+\\sin^2\\alpha=1$. This is not a separate theorem but Pythagoras on the circle.',
      'The radian is not a new unit but the length of the arc belonging to the angle on the unit circle. The full circle has circumference $2\\pi$, hence $360^\\circ=2\\pi$ and $180^\\circ=\\pi$. That is why differentiation gives $(\\sin x)\'=\\cos x$, and not some factor involving $180/\\pi$.'
    ],
    when: 'In limits ($\\frac{\\sin x}{x}$), differentiation, integration, the trigonometric form of complex numbers and Fourier series. Without knowing the special angles and the signs by quadrant, these problems will be slow and error-prone.',
    theory: [
      {
        title: 'Basic definitions'
      },
      {
        title: 'Special angles'
      },
      {
        title: 'Quadrants and signs',
        body: 'Moving around the unit circle: in quadrant I both are positive; in II, $\\sin>0$, $\\cos<0$; in III both are negative; in IV, $\\sin<0$, $\\cos>0$. The sign of $\\tan$ comes from the quotient of $\\sin$ and $\\cos$.'
      },
      {
        title: 'Addition and double-angle formulas'
      },
      {
        title: 'Mixing degrees and radians',
        body: 'Differentiation and limits work only in radians. If a problem uses degrees, convert first: $\\alpha_{\\text{rad}}=\\alpha^\\circ\\cdot\\frac{\\pi}{180}$.'
      },
      {
        title: 'Trigonometric equations',
        body: 'The solutions of $\\sin x=\\frac12$ are $x=\\frac{\\pi}{6}+2k\\pi$ or $x=\\frac{5\\pi}{6}+2k\\pi$ ($k\\in\\mathbb Z$). There are two points at this height on the unit circle, and because of the period both repeat infinitely many times.'
      },
      {
        title: 'Worth knowing by heart',
        items: [
          '$\\sin(-x)=-\\sin x$, $\\cos(-x)=\\cos x$ (odd and even, respectively).',
          'Both are periodic with $2\\pi$; the period of $\\tan$ is $\\pi$.',
          'The maximum of $\\sin x$ is $1$, the minimum is $-1$; the same holds for $\\cos$.',
          '$\\cos x=0$ where $x=\\frac{\\pi}{2}+k\\pi$; there $\\tan$ is undefined.'
        ]
      }
    ],
    examples: [
      {
        title: 'An angle outside the table',
        problem: 'What are $\\cos(2\\pi/3)$ and $\\sin(5\\pi/6)$?',
        steps: [
          '$2\\pi/3=\\pi-\\pi/3$: in the second quadrant the cosine is negative, the reference angle is $\\pi/3$.',
          '$\\cos(2\\pi/3)=-\\cos(\\pi/3)=-1/2$.',
          '$5\\pi/6=\\pi-\\pi/6$: also the second quadrant, the sine is positive.',
          '$\\sin(5\\pi/6)=\\sin(\\pi/6)=1/2$.'
        ],
        answer: '$\\cos(2\\pi/3)=-1/2$, $\\sin(5\\pi/6)=1/2$'
      },
      {
        title: 'Trigonometric equation',
        problem: 'Solve on the interval $[0,2\\pi)$: $2\\sin^2x-\\sin x-1=0$.',
        steps: [
          'Introduce the substitution $t=\\sin x$, where $|t|\\le1$.',
          '$2t^2-t-1=0$, that is $(2t+1)(t-1)=0$.',
          '$t=1$: $\\sin x=1$, hence $x=\\pi/2$.',
          '$t=-1/2$: $\\sin x=-1/2$, hence $x=7\\pi/6$ or $x=11\\pi/6$.',
          'All three solutions lie in the interval $[0,2\\pi)$.'
        ],
        answer: '$x=\\frac{\\pi}{2},\\frac{7\\pi}{6},\\frac{11\\pi}{6}$'
      }
    ],
    mistakes: [
      'For $\\sin x=\\frac12$ writing down only $\\pi/6$ and forgetting $5\\pi/6$.',
      'For $\\cos(2\\pi/3)$ taking the sign from the calculator instead of from the quadrant.',
      'Differentiating in degrees: $(\\sin x)\'=\\cos x$ holds only in radians.',
      'Reading $\\sin^2 x$ as $\\sin(x^2)$. $\\sin^2 x=(\\sin x)^2$.'
    ],
    exercises: [
      {
        q: 'What is $\\sin(5\\pi/6)$?',
        hint: '$5\\pi/6=\\pi-\\pi/6$, second quadrant.',
        sol: '$\\sin(5\\pi/6)=\\sin(\\pi/6)=1/2$.'
      },
      {
        q: 'What is $\\tan(3\\pi/4)$?',
        hint: '$3\\pi/4=\\pi-\\pi/4$; the tangent is negative in the second quadrant.',
        sol: '$\\tan(3\\pi/4)=-\\tan(\\pi/4)=-1$.'
      },
      {
        q: 'Solve on the interval $[0,2\\pi)$: $\\sin x=\\frac12$. Give the smaller solution.',
        hint: 'There are two points on the unit circle at this height.',
        sol: '$x=\\pi/6$ or $x=5\\pi/6$; the smaller one is $\\pi/6$.'
      },
      {
        q: 'Solve: $2\\sin^2x-\\sin x-1=0$ on the interval $[0,2\\pi)$. How many solutions are there?',
        hint: 'Substitute $t=\\sin x$, then $|t|\\le1$.',
        sol: '$t=1$ or $t=-1/2$. Solutions: $\\pi/2,7\\pi/6,11\\pi/6$ — three of them.'
      },
      {
        q: 'Simplify: $\\sin^2x+\\cos^2x$.',
        hint: 'The equation of the unit circle.',
        sol: 'The point lies on the circle $x^2+y^2=1$, hence the sum is $1$.'
      },
      {
        q: 'What is $\\cos(2x)$ if $\\sin x=\\frac35$ and $x$ lies in the first quadrant?',
        hint: '$\\cos^2x=1-\\sin^2x$, then $\\cos2x=\\cos^2x-\\sin^2x$.',
        sol: '$\\cos x=4/5$, hence $\\cos2x=16/25-9/25=7/25$.'
      },
      {
        q: 'How many radians is $180^\\circ$?',
        hint: 'The arc length of a semicircle on the unit circle.',
        sol: '$180^\\circ=\\pi$ radians.'
      }
    ],
    video: {
      title: 'Trigonometry on the unit circle',
      channel: 'Hungarian mathematics channels'
    }
  };

  MB.enContent['alapok/fuggvenyek'] = {
    title: 'Functions, domain, inverse',
    lead: 'A function is not a formula but an assignment: exactly one output for every input. Most university problems depend on the set on which this assignment is defined, and on whether it is invertible.',
    why: [
      'The domain is not a formal decoration. If the inside of a logarithm is negative, the expression is undefined; if a denominator is zero, the function does not exist there. Exactly these points will be interesting when studying limits and continuity.',
      'The inverse function is the idea that the assignment can also be performed backwards. This works only if different inputs have different outputs (injectivity) and every output actually occurs (surjectivity). In differentiation, the derivative of the inverse comes from this backwards way of thinking.'
    ],
    when: 'The first step of every function analysis: what is the domain? The inverse function is needed to understand the exponential/logarithm, the trigonometric/arc functions and the differentiation rules. In ZH (in-class tests) there is usually a separate problem on the domain and the inverse.',
    theory: [
      {
        title: 'Function, domain, range',
        body: 'The function $f:A\\to B$ assigns to every $a\\in A$ exactly one element $f(a)\\in B$. $A$ is the domain, and the set of actual outputs is the range. The domain must be determined from the expression: the inside of a logarithm $>0$, under an even root $\\ge0$, the denominator $\\neq0$.'
      },
      {
        title: 'Injective, surjective, bijective',
        body: 'Injective: $f(x)=f(y)\\Rightarrow x=y$ (different inputs give different outputs). Surjective: for every $b\\in B$ there is an $a$ with $f(a)=b$. Bijective: both. Exactly a bijective function has an inverse.'
      },
      {
        title: 'Inverse function',
        body: 'If $f$ is bijective, then $f^{-1}$ is the function with $f^{-1}(f(x))=x$ and $f(f^{-1}(y))=y$. Its graph is the reflection in the line $y=x$. For example, the inverse of $f(x)=2x+3$ is $f^{-1}(x)=\\frac{x-3}{2}$; the inverse of $e^x$ is $\\ln x$.'
      },
      {
        title: 'Composite function',
        note: 'The inner function is $f$, the outer one is $g$. The order cannot be swapped: in general $g\\circ f\\neq f\\circ g$.'
      },
      {
        title: 'Not every function is invertible',
        body: '$f(x)=x^2$ as a map $\\mathbb R\\to\\mathbb R$ is not injective, because $f(2)=f(-2)$. If we restrict the set to $[0,\\infty)$, it becomes bijective and its inverse is $\\sqrt x$. That is why the domain and the range must always be given.'
      },
      {
        title: 'Transformations',
        items: [
          '$f(x)+c$: vertical shift upwards.',
          '$f(x-c)$: horizontal shift to the right.',
          '$c f(x)$: vertical stretch/compression.',
          '$-f(x)$: reflection in the $x$-axis; $f(-x)$: reflection in the $y$-axis.'
        ]
      }
    ],
    examples: [
      {
        title: 'Domain',
        problem: 'Determine the domain of the function $g(x)=\\dfrac{\\sqrt{x^2-x-6}}{x-4}$.',
        steps: [
          'Under the root: $x^2-x-6\\ge0$, that is $(x-3)(x+2)\\ge0$. An upward-opening parabola, hence $x\\le-2$ or $x\\ge3$.',
          'The denominator: $x-4\\neq0$, so $x\\neq4$.',
          'The intersection of the two conditions: $(-\\infty,-2]\\cup[3,4)\\cup(4,\\infty)$.'
        ],
        answer: '$D_g=(-\\infty,-2]\\cup[3,4)\\cup(4,\\infty)$'
      },
      {
        title: 'Inverse function',
        problem: 'Determine the inverse of the function $f(x)=2x+3$.',
        steps: [
          'Write it in the form $y=2x+3$.',
          'Express $x$: $x=\\frac{y-3}{2}$.',
          'Swap the letters: $f^{-1}(x)=\\frac{x-3}{2}$.',
          'Check: $f(f^{-1}(x))=2\\cdot\\frac{x-3}{2}+3=x$.'
        ],
        answer: '$f^{-1}(x)=\\dfrac{x-3}{2}$'
      },
      {
        title: 'Composite function',
        problem: 'Let $f(x)=x^2$ and $g(x)=\\ln x$. Determine $(g\\circ f)(x)$ and its domain.',
        steps: [
          '$(g\\circ f)(x)=g(f(x))=\\ln(x^2)$.',
          'The inside of the logarithm is positive: $x^2>0$, that is $x\\neq0$.',
          'Thus $(g\\circ f)(x)=\\ln(x^2)=2\\ln|x|$, defined for $x\\neq0$.'
        ],
        answer: '$\\ln(x^2)=2\\ln|x|$, $x\\neq0$'
      }
    ],
    mistakes: [
      'Checking only the root and not the denominator when finding the domain.',
      'Not swapping $x$ and $y$ when finding the inverse, so the function stays the same.',
      'Confusing $f^{-1}(x)$ with $\\frac{1}{f(x)}$. The inverse is not the reciprocal!',
      'Identifying $\\ln(x^2)$ with $\\ln x$; in fact it is $2\\ln|x|$.'
    ],
    exercises: [
      {
        q: 'Give the domain of $g(x)=\\dfrac{\\sqrt{x^2-x-6}}{x-4}$.',
        hint: 'Under the root $\\ge0$, in the denominator $\\neq0$.',
        sol: '$(x-3)(x+2)\\ge0\\Rightarrow x\\le-2$ or $x\\ge3$; and $x\\neq4$.',
        altEn: ['x<=-2 or 3<=x<4 or x>4']
      },
      {
        q: 'What is the inverse of $f(x)=2x+3$?',
        hint: 'Solve $y=2x+3$ for $x$.',
        sol: '$x=(y-3)/2$, hence $f^{-1}(x)=(x-3)/2$.'
      },
      {
        q: 'What is the inverse of $f(x)=e^x$?',
        hint: 'Which function returns the exponent?',
        sol: '$f^{-1}(x)=\\ln x$, defined for $x>0$.'
      },
      {
        q: 'Let $f(x)=x^2$, $g(x)=\\ln x$. What is the value of $(g\\circ f)(e)$?',
        hint: 'First $f(e)=e^2$, then $g(e^2)$.',
        sol: '$\\ln(e^2)=2$.'
      },
      {
        q: 'Is $f(x)=x^2$ injective in the sense $\\mathbb R\\to\\mathbb R$?',
        choices: ['Yes', 'No'],
        sol: 'No: $f(2)=f(-2)=4$, so different inputs give the same output.'
      },
      {
        q: 'Give the domain of $f(x)=\\ln(4-x^2)$.',
        hint: '$4-x^2>0$.',
        sol: '$4-x^2>0\\Rightarrow x^2<4\\Rightarrow -2<x<2$.'
      }
    ],
    video: {
      title: 'Composing functions',
      channel: 'FZsMatek · Felsőfok'
    }
  };

  MB.enContent['alapok/egyenletek'] = {
    title: 'Equations, inequalities, absolute value',
    lead: 'With inequalities we do not "rearrange" but examine signs. This is the routine from which the $\\varepsilon$-inequalities of limit definitions and the proofs of continuity are built.',
    why: [
      'Multiplying an inequality by a negative number reverses its direction. That is why you must never multiply by an expression of unknown sign: a fractional inequality is always solved by moving everything to one side, bringing it to a common denominator, and making a sign table.',
      'The expression $|x-a|<\\varepsilon$ is not an "absolute-value equation" but a distance: the distance of $x$ from $a$ is less than $\\varepsilon$. Hence $a-\\varepsilon<x<a+\\varepsilon$. Every limit definition in Calculus 1 uses this reformulation.'
    ],
    when: 'In limit proofs ($|a_n-A|<\\varepsilon$), in continuity ($|x-a|<\\delta$), in the sign table of differentiation and in the intervals of area in integration. Without the routine of inequalities the definitions seem incomprehensible.',
    theory: [
      {
        title: 'Quadratic equation',
        note: 'The discriminant is $D=b^2-4ac$. If $D<0$, there is no real root; if $D=0$, there is one double root.'
      },
      {
        title: 'Viète formulas',
        body: '$x_1+x_2=-\\frac{b}{a}$ and $x_1x_2=\\frac{c}{a}$. These let you check the sum and the product of the roots quickly.'
      },
      {
        title: 'Quadratic inequality',
        body: 'The sign of $ax^2+bx+c$ is given by the shape of the parabola. If $a>0$ (opening upwards), the expression is positive outside the roots and negative between them. If $a<0$, the other way round. At the roots the expression is zero; for a strict inequality these are not included.'
      },
      {
        title: 'Fractional inequality',
        body: 'To solve $\\frac{x+1}{x-2}\\ge0$ you must not "cross-multiply" by $x-2$, because its sign is unknown. A sign table is needed: the numerator changes sign at $x=-1$, the denominator at $x=2$. Solution: $(-\\infty,-1]\\cup(2,\\infty)$. The point $x=2$ is not a solution, because the denominator is zero.'
      },
      {
        title: 'Absolute value'
      },
      {
        title: 'Absolute-value inequalities'
      },
      {
        title: 'Triangle inequality',
        body: '$|a+b|\\le|a|+|b|$. This is the basis of estimates: when we want to bound an expression from above, we often split the terms with it.'
      }
    ],
    examples: [
      {
        title: 'Fractional inequality',
        problem: 'Solve: $\\dfrac{x-1}{x+3}<2$.',
        steps: [
          'Move everything to one side: $\\dfrac{x-1}{x+3}-2<0$.',
          'Common denominator: $\\dfrac{x-1-2(x+3)}{x+3}=\\dfrac{-x-7}{x+3}<0$.',
          'Multiply by $-1$ (the direction flips): $\\dfrac{x+7}{x+3}>0$.',
          'Sign table: the numerator changes at $x=-7$, the denominator at $x=-3$. The fraction is positive when both have the same sign: $x<-7$ or $x>-3$.'
        ],
        answer: '$x\\in(-\\infty,-7)\\cup(-3,\\infty)$'
      },
      {
        title: 'Absolute-value inequality',
        problem: 'Solve: $|2x+1|\\ge5$.',
        steps: [
          'Two cases: $2x+1\\ge5$ or $2x+1\\le-5$.',
          'From the first, $x\\ge2$.',
          'From the second, $x\\le-3$.',
          'The solution is the union of the two half-lines.'
        ],
        answer: '$x\\in(-\\infty,-3]\\cup[2,\\infty)$'
      },
      {
        title: 'Radical equation',
        problem: 'Solve: $\\sqrt{x+3}=x-3$.',
        steps: [
          'Condition: $x+3\\ge0$, and the right-hand side must also be nonnegative, since a root is $\\ge0$: $x-3\\ge0$, that is $x\\ge3$.',
          'Squaring: $x+3=(x-3)^2=x^2-6x+9$.',
          '$x^2-7x+6=0$, with roots $x=1$ and $x=6$.',
          '$x=1$ does not satisfy $x\\ge3$; only $x=6$ is a solution. Check: $\\sqrt9=3$, $6-3=3$.'
        ],
        answer: '$x=6$'
      }
    ],
    mistakes: [
      'Multiplying through by the denominator in a fractional inequality (its sign is unknown).',
      'Not checking the conditions after squaring a radical equation (extraneous root).',
      'Giving the solution of $|x|\\ge c$ as $x\\ge c$, forgetting the branch $x\\le-c$.',
      'Not checking the obtained root against the domain in a logarithmic equation.'
    ],
    exercises: [
      {
        q: 'Solve: $\\dfrac{x-1}{x+3}<2$. Give the interval.',
        hint: 'Bring everything to a common denominator; do not multiply by $x+3$.',
        sol: '$\\frac{x-1-2x-6}{x+3}<0\\Rightarrow\\frac{-x-7}{x+3}<0\\Rightarrow x<-7$ or $x>-3$.',
        altEn: ['x<-7 or x>-3']
      },
      {
        q: 'Solve: $|2x+1|\\ge5$.',
        hint: 'Two cases.',
        sol: '$x\\ge2$ or $x\\le-3$.',
        altEn: ['x<=-3 or x>=2']
      },
      {
        q: 'Solve: $\\sqrt{x+3}=x-3$.',
        hint: 'Condition: $x\\ge3$, then square.',
        sol: '$x+3=x^2-6x+9\\Rightarrow x^2-7x+6=0\\Rightarrow x=1$ or $6$; only $6$ works.'
      },
      {
        q: 'Solve: $x^2-5x+6=0$. Give the sum of the roots.',
        hint: 'Viète: $x_1+x_2=-b/a$.',
        sol: '$x_1+x_2=5$, $x_1x_2=6$; the roots are $2$ and $3$.'
      },
      {
        q: 'Solve: $x^2-5x+6>0$.',
        hint: 'Upward-opening parabola; positive outside the roots.',
        sol: '$(x-2)(x-3)>0\\Rightarrow x<2$ or $x>3$.',
        altEn: ['x<2 or x>3']
      },
      {
        q: 'Solve: $\\ln(x^2)=2\\ln 2$. Give all real solutions.',
        hint: '$\\ln(x^2)=2\\ln|x|$, and $x\\neq0$.',
        sol: '$2\\ln|x|=2\\ln2\\Rightarrow\\ln|x|=\\ln2\\Rightarrow|x|=2\\Rightarrow x=\\pm2$.',
        altEn: ['x=2 or x=-2']
      }
    ],
    video: {
      title: 'Inequalities and absolute value',
      channel: 'Hungarian mathematics channels'
    }
  };
})();
