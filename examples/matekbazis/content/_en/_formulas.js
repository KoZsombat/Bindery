(function () {
  const MB = window.MB;
  MB.enFormulas = [
    /* Basics */
    { cat: 'Basics', name: 'Power rules', note: 'Fractional exponents are only safe with a positive base.' },
    { cat: 'Basics', name: 'Fractional exponent', note: 'For even roots, $x\\ge0$.' },
    { cat: 'Basics', name: 'Definition of logarithm', note: '$a>0$, $a\\neq1$, $b>0$.' },
    { cat: 'Basics', name: 'Logarithm identities', note: 'Only for positive arguments.' },
    { cat: 'Basics', name: 'Change of base', note: '' },
    { cat: 'Basics', name: 'Special products', note: '' },
    { cat: 'Basics', name: 'Basic trigonometric identity', note: '' },
    { cat: 'Basics', name: 'Addition formulas', note: '' },
    { cat: 'Basics', name: 'Double-angle formulas', note: '' },
    { cat: 'Basics', name: 'Quadratic formula', note: '' },
    { cat: 'Basics', name: "Vieta's formulas", note: '' },
    { cat: 'Basics', name: 'Absolute value as distance', note: 'The basis of the limit definitions.' },
    { cat: 'Basics', name: 'Triangle inequality', note: '' },

    /* Logic */
    { cat: 'Logic', name: 'Negating quantifiers', note: 'The quantifier flips and the inner statement is negated.' },
    { cat: 'Logic', name: "De Morgan's laws", note: '' },
    { cat: 'Logic', name: 'Negating an implication', note: '' },
    { cat: 'Logic', name: 'Contraposition', note: '' },
    { cat: 'Logic', name: 'Inclusion–exclusion', note: '' },

    /* Complex numbers */
    { cat: 'Complex numbers', name: 'Algebraic form', note: '' },
    { cat: 'Complex numbers', name: 'Division', note: 'Expand the fraction with the conjugate of the denominator.' },
    { cat: 'Complex numbers', name: 'Trigonometric form', note: '' },
    { cat: 'Complex numbers', name: "Euler's formula", note: '' },
    { cat: 'Complex numbers', name: "De Moivre's theorem", note: '' },
    { cat: 'Complex numbers', name: 'n-th roots', note: '$k=0,\\dots,n-1$.' },
    { cat: 'Complex numbers', name: 'Conjugate root pair', note: 'For polynomials with real coefficients.' },

    /* Sequences */
    { cat: 'Sequences', name: 'Convergence', note: '' },
    { cat: 'Sequences', name: 'Operations with limits', note: 'For division, $B\\neq0$.' },
    { cat: 'Sequences', name: 'Squeeze theorem', note: '' },
    { cat: 'Sequences', name: 'Notable limit', note: '' },
    { cat: 'Sequences', name: 'Orders of growth', note: '$a>1$, $k>0$.' },
    { cat: 'Sequences', name: 'Root limits', note: '' },

    /* Limits of functions */
    { cat: 'Limits of functions', name: 'ε–δ definition', note: '' },
    { cat: 'Limits of functions', name: 'Continuity', note: '' },
    { cat: 'Limits of functions', name: 'Notable limits', note: '' },
    { cat: 'Limits of functions', name: 'Oblique asymptote', note: '' },
    { cat: 'Limits of functions', name: 'Sequential criterion', note: '' },

    /* Differentiation */
    { cat: 'Differentiation', name: 'Definition of the derivative', note: '' },
    { cat: 'Differentiation', name: 'Equation of the tangent line', note: '' },
    { cat: 'Differentiation', name: 'Sum and constant rules', note: '' },
    { cat: 'Differentiation', name: 'Product and quotient rules', note: '' },
    { cat: 'Differentiation', name: 'Chain rule', note: '' },
    { cat: 'Differentiation', name: 'Basic derivatives', note: '' },
    { cat: 'Differentiation', name: 'Trigonometric derivatives', note: '' },
    { cat: 'Differentiation', name: 'Derivative of the inverse function', note: '' },
    { cat: 'Differentiation', name: 'Implicit differentiation', note: '' },
    { cat: 'Differentiation', name: 'Parametric derivative', note: '' },
    { cat: 'Differentiation', name: "L'Hôpital's rule", note: 'Only for $0/0$ or $\\infty/\\infty$ forms.' },
    { cat: 'Differentiation', name: 'Monotonicity', note: '', latexEn: String.raw`f'>0\Rightarrow f\ \text{increasing},\quad f'<0\Rightarrow f\ \text{decreasing}` },
    { cat: 'Differentiation', name: 'Convexity', note: '', latexEn: String.raw`f''>0\Rightarrow\text{convex},\quad f''<0\Rightarrow\text{concave}` },

    /* Integration */
    { cat: 'Integration', name: 'Basic integrals', note: '$n\\neq-1$.' },
    { cat: 'Integration', name: 'Exponential and trigonometric', note: '' },
    { cat: 'Integration', name: 'Substitution', note: '' },
    { cat: 'Integration', name: 'Integration by parts', note: '' },
    { cat: 'Integration', name: 'Newton–Leibniz formula', note: "$F'=f$." },
    { cat: 'Integration', name: 'Area', note: '' },
    { cat: 'Integration', name: 'Volume of a solid of revolution', note: 'Rotation about the $x$-axis.' },
    { cat: 'Integration', name: 'Improper integral', note: 'Divergent for $p\\le1$.' },

    /* Series */
    { cat: 'Series', name: 'Geometric series', note: '' },
    { cat: 'Series', name: 'Necessary condition for convergence', note: 'The converse is false: $\\sum1/n$ diverges.' },
    { cat: 'Series', name: 'p-series', note: '' },
    { cat: 'Series', name: 'Ratio test', note: '' },
    { cat: 'Series', name: 'Root test', note: '' },
    { cat: 'Series', name: 'Leibniz series', note: '' },
    { cat: 'Series', name: 'Leibniz error bound', note: '' },

    /* Taylor series */
    { cat: 'Taylor series', name: 'Taylor polynomial', note: '' },
    { cat: 'Taylor series', name: 'Lagrange remainder', note: '' },
    { cat: 'Taylor series', name: 'Notable series', note: '' },
    { cat: 'Taylor series', name: 'Binomial series', note: '$|x|<1$.' },

    /* Multivariable */
    { cat: 'Multivariable calculus', name: 'Gradient', note: 'The direction of steepest increase.' },
    { cat: 'Multivariable calculus', name: 'Tangent plane', note: '' },
    { cat: 'Multivariable calculus', name: 'Directional derivative', note: '$\\mathbf u$ is a unit vector.' },
    { cat: 'Multivariable calculus', name: 'Hessian determinant', note: '' },
    { cat: 'Multivariable calculus', name: 'Lagrange multiplier', note: 'Constrained extremum subject to $g(x,y)=0$.' },
    { cat: 'Multivariable calculus', name: 'Polar coordinates', note: '' },
    { cat: 'Multivariable calculus', name: 'Cylindrical coordinates', note: '' },
    { cat: 'Multivariable calculus', name: 'Spherical coordinates', note: '' },

    /* Differential equations / Fourier */
    { cat: 'Differential equations', name: 'Separable', note: '' },
    { cat: 'Differential equations', name: 'First-order linear', note: '' },
    { cat: 'Differential equations', name: 'Linear recurrence', note: 'The roots of the characteristic equation give the solution.' },
    { cat: 'Fourier series', name: 'Fourier coefficients', note: '' },
    { cat: 'Fourier series', name: 'Fourier series', note: '' },

    /* Linear algebra */
    { cat: 'Linear algebra', name: 'Dot product', note: '' },
    { cat: 'Linear algebra', name: 'Cross product', note: '' },
    { cat: 'Linear algebra', name: '2×2 determinant', note: '' },
    { cat: 'Linear algebra', name: '2×2 inverse', note: '' },
    { cat: 'Linear algebra', name: 'Determinant of a product', note: '' },
    { cat: 'Linear algebra', name: 'Eigenvalue', note: '' },
    { cat: 'Linear algebra', name: 'Trace and determinant', note: '' },

    /* Discrete mathematics */
    { cat: 'Discrete mathematics', name: 'Congruence', note: '' },
    { cat: 'Discrete mathematics', name: "Fermat's little theorem", note: '' },
    { cat: 'Discrete mathematics', name: 'Binomial coefficient', note: '' },
    { cat: 'Discrete mathematics', name: 'Binomial theorem', note: '' },
    { cat: 'Discrete mathematics', name: 'Handshake lemma', note: '' },
    { cat: 'Discrete mathematics', name: 'Number of edges in a tree', note: '', latexEn: String.raw`\text{tree with }n\text{ vertices}\Rightarrow |E|=n-1` }
  ];
})();
