(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['tobbvaltozos/tobbvaltozos-derivalt'] = {
    title: 'Limit, partial and total derivative',
    lead: R`For a function of two variables, $\lim_{(x,y)\to(a,b)}f(x,y)$ means that along every path it must tend to the same value. The partial derivative examines the behaviour only along two distinguished paths, so by itself it is not enough: total differentiability is what it means for the surface to be smooth.`,
    why: [
      R`In the one-variable case one can approach from two sides, and if both give the same value, we are done. In the plane, however, infinitely many curves lead to the point: the $x$-axis, the $y$-axis, the diagonal $y=x$, any spiral. The limit exists only if all of them give the same value. That is why the most common exam task is not to compute a limit but to show, by exhibiting two paths with different values, that the limit does not exist.`,
      R`A partial derivative freezes one variable, so it is really one-variable differentiation. That makes it easy to compute — and that is also why it is dangerous: the existence of partial derivatives does not guarantee continuity, because it says nothing about the other directions. Total differentiability is stronger: it means that the surface can be well approximated locally by a plane, and from this continuity already follows.`
    ],
    when: 'In every task where the behaviour of a two-variable function must be assessed: does the limit exist, is the function continuous at the origin, is it differentiable, what is the tangent plane at a point, in which direction does it grow fastest. The gradient and the tangent plane are the basis of extremum search and numerical optimisation, and the directional derivative answers the question "which way should we go".',
    theory: [
      { title: 'Limit of a function of two variables', body: R`$\lim_{(x,y)\to(a,b)} f(x,y)=L$ if for every $\varepsilon>0$ there is a $\delta>0$ such that for $0<\sqrt{(x-a)^2+(y-b)^2}<\delta$ we have $|f(x,y)-L|<\varepsilon$. The transfer principle works here too: the image of every sequence of points tending to $(a,b)$ and avoiding the point tends to the same $L$.` },
      { title: 'A limit cannot exist "depending on the path"', body: R`For $f(x,y)=\dfrac{xy}{x^2+y^2}$, along the path $y=0$ we have $f(x,0)=0$, while along the path $y=x$ we have $f(x,x)=\dfrac{x^2}{2x^2}=\dfrac12$. Two paths, two different limits, so the limit does not exist. This is the most important type of counterexample: you do not have to try every path, it is enough to find two that give different values.` },
      { title: 'Continuity', body: R`$f$ is continuous at the point $(a,b)$ if it is defined there, the limit exists, and $\lim_{(x,y)\to(a,b)}f(x,y)=f(a,b)$. Polynomials and quotients of two polynomials (where the denominator is nonzero) are continuous.` },
      { title: 'Partial derivative', body: R`The partial derivative is the ordinary derivative with respect to one variable, treating the other as constant:
$$f_x(a,b)=\lim_{h\to0}\frac{f(a+h,b)-f(a,b)}{h},\qquad f_y(a,b)=\lim_{h\to0}\frac{f(a,b+h)-f(a,b)}{h}.$$
Notation: $f_x=\partial f/\partial x$, $f_y=\partial f/\partial y$; the second-order ones are $f_{xx},f_{xy},f_{yx},f_{yy}$.` },
      { title: 'Partial derivative ≠ continuity', body: R`Let $f(x,y)=\dfrac{xy}{x^2+y^2}$ outside the origin, and $f(0,0)=0$. Then $f(x,0)=0$ for every $x$, hence $f_x(0,0)=0$; likewise $f_y(0,0)=0$. Yet the function is not continuous at the origin, because along the path $y=x$ the limit is $1/2\neq f(0,0)$. Partial derivatives see only two directions.` },
      { title: 'Total differentiability', body: R`$f$ is totally differentiable at $(a,b)$ if there exist numbers $A,B$ such that
$$f(a+h,b+k)=f(a,b)+Ah+Bk+o\!\left(\sqrt{h^2+k^2}\right),$$
where the error tends to zero faster than the distance. Then necessarily $A=f_x(a,b)$, $B=f_y(a,b)$, so the linear part can be written with the gradient.` },
      { title: 'Sufficient condition', body: R`If the partial derivatives $f_x$ and $f_y$ exist in a neighbourhood of $(a,b)$ and are continuous there, then $f$ is totally differentiable at $(a,b)$. In that case $f$ is also continuous. The converse of the theorem is false: differentiability does not imply continuity of the partial derivatives.` },
      { title: 'Gradient, directional derivative, tangent plane', note: R`The gradient points in the direction of the greatest increase, its length is the maximum directional derivative; it is perpendicular to the level curves. The vector $\mathbf u$ must be a unit vector, otherwise the value is also scaled by the length.` }
    ],
    examples: [
      {
        title: 'A limit tending to zero by estimation',
        problem: R`Compute: $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x^2y}{x^2+y^2}$.`,
        steps: [
          R`There is no need to switch to polar coordinates: let us estimate. Since $x^2\le x^2+y^2$, we have
$$\left|\frac{x^2y}{x^2+y^2}\right|=|y|\cdot\frac{x^2}{x^2+y^2}\le |y|.$$`,
          R`And $|y|$ tends to zero, regardless of the path along which we approach.`,
          R`In polar the same thing: $x=r\cos\varphi$, $y=r\sin\varphi$, so the expression is $r\cos^2\varphi\sin\varphi$, which is bounded by $r$ because $|\cos^2\varphi\sin\varphi|\le1$.`,
          R`By the squeeze theorem the limit is $0$.`
        ],
        answer: R`$0$`
      },
      {
        title: 'A limit that does not exist, shown along two paths',
        problem: R`Does $\displaystyle\lim_{(x,y)\to(0,0)}\frac{xy}{x^2+y^2}$ exist?`,
        steps: [
          R`First path: $y=0$. Then $f(x,0)=\dfrac{0}{x^2}=0$ for every $x\neq0$, so the limit is $0$.`,
          R`Second path: $y=x$. Then $f(x,x)=\dfrac{x^2}{2x^2}=\dfrac12$ for every $x\neq0$, so the limit is $1/2$.`,
          R`Two different values for the same point: the limit does not exist.`,
          R`In polar this is even more visual: $f=\dfrac{r^2\cos\varphi\sin\varphi}{r^2}=\frac12\sin2\varphi$, which depends only on the angle — it does not decrease with the radius.`
        ],
        answer: R`It does not exist (both $0$ and $1/2$ occur)`
      },
      {
        title: 'Gradient and tangent plane',
        problem: R`Let $f(x,y)=x^2y+y^3$. Determine its gradient, then the tangent plane at the point $(1,2)$.`,
        steps: [
          R`Partial derivatives: $f_x=2xy$, $f_y=x^2+3y^2$.`,
          R`At the point $(1,2)$: $f_x(1,2)=4$, $f_y(1,2)=1+12=13$, so $\nabla f(1,2)=(4,13)$.`,
          R`The function value: $f(1,2)=1^2\cdot2+2^3=2+8=10$.`,
          R`The tangent plane: $z=10+4(x-1)+13(y-2)$, that is $z=4x+13y-20$.`,
          R`Check: at the point $(1,2)$, $4+26-20=10$, and the slope of the plane is $4$ in the $x$ direction and $13$ in the $y$ direction.`
        ],
        answer: R`$\nabla f(1,2)=(4,13)$, tangent plane: $z=4x+13y-20$`
      }
    ],
    mistakes: [
      R`Computing the limit along a single path and considering the job done. One path only proves that the limit cannot be anything else, but not that it exists.`,
      R`Believing that if $f_x$ and $f_y$ exist, then the function is continuous. The counterexample is $xy/(x^2+y^2)$.`,
      R`Not multiplying by a unit vector in the directional derivative: $D_{\mathbf u}f=\nabla f\cdot\frac{\mathbf u}{\|\mathbf u\|}$.`,
      R`Leaving out the function value in the formula of the tangent plane: the plane is not $z=f_x\Delta x+f_y\Delta y$, it starts with $f(a,b)$.`
    ],
    exercises: [
      { q: R`What is $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x^2y}{x^2+y^2}$?`, hint: R`Estimate: $\frac{x^2}{x^2+y^2}\le1$.`, sol: R`$\left|\frac{x^2y}{x^2+y^2}\right|\le|y|\to0$, so the limit is $0$.` },
      { q: R`Does the limit $\displaystyle\lim_{(x,y)\to(0,0)}\frac{xy}{x^2+y^2}$ exist?`, choices: ['Yes, and its value is $0$', 'Yes, and its value is $1/2$', 'It does not exist'], sol: R`No: along $y=0$ it is $0$, along $y=x$ it is $1/2$.` },
      { q: R`Let $f(x,y)=x^2y+y^3$. What is $f_x(1,2)$?`, hint: R`$f_x=2xy$.`, sol: R`$f_x=2xy$, so $f_x(1,2)=4$.` },
      { q: R`For the same $f$, what is $f_y(1,2)$?`, hint: R`$f_y=x^2+3y^2$.`, sol: R`$f_y=x^2+3y^2$, so $f_y(1,2)=1+12=13$.` },
      { q: R`What is the tangent plane of the surface $z=x^2+y^2$ at the point $(1,1)$? Write it in the form $z=Ax+By+C$, and give the three coefficients.`, hint: R`$f_x=f_y=2x$ and $2y$ respectively; $f(1,1)=2$.`, sol: R`$z=2+2(x-1)+2(y-1)=2x+2y-2$.` },
      { q: R`What is the directional derivative of $f(x,y)=x^2y+y^3$ at the point $(1,2)$ in the direction of the unit vector $\mathbf u=\left(\frac35,\frac45\right)$?`, hint: R`$D_{\mathbf u}f=\nabla f\cdot\mathbf u$.`, sol: R`$\nabla f(1,2)=(4,13)$, so $D_{\mathbf u}f=4\cdot\frac35+13\cdot\frac45=\frac{12+52}{5}=\frac{64}{5}$.` },
      { q: R`Prove that the function $f(x,y)=\dfrac{xy}{x^2+y^2}$ ($(x,y)\neq(0,0)$), $f(0,0)=0$ has both partial derivatives at the origin, yet is not continuous there. Prove both statements.`, sol: R`$f(x,0)=0$ for every $x\neq0$, so $f_x(0,0)=\lim_{h\to0}\frac{0-0}{h}=0$; likewise $f_y(0,0)=0$. However, along the path $y=x$ we have $f(x,x)=\frac12\to\frac12\neq f(0,0)=0$, so the function is not continuous at the origin. The existence of the partial derivatives is therefore not sufficient for continuity.` },
      { q: R`Is the function $f(x,y)=\frac{x^2y}{x^2+y^2}$ ($(x,y)\neq(0,0)$), $f(0,0)=0$ continuous at the origin?`, choices: ['Yes', 'No'], sol: R`Yes: the limit is $0=f(0,0)$, which is proved by the estimate $\le|y|$.` }
    ],
    video: { title: 'Limits and partial derivatives of functions of several variables', channel: 'Hungarian mathematics channels' }
  };

  MB.enContent['tobbvaltozos/tobbvaltozos-szelsoseg'] = {
    title: 'Extrema, Hessian matrix, Lagrange',
    lead: 'Finding an extremum consists of two steps: first we find the critical points where the gradient is zero, then with second-order information we decide whether it is a minimum, a maximum or a saddle point. Under a constraint (curve, surface) the condition is no longer a free gradient but the parallelity of the gradient and the gradient of the constraint.',
    why: [
      R`In the one-variable case the sign of the derivative tells us whether the function grows or decreases, and the second derivative decides the type of the extremum. In two variables the gradient takes the place of the derivative: if it is not zero, moving in that direction changes the function, so an extremum can only occur where $\nabla f=0$. This is a necessary condition, but not a sufficient one — hence the second step.`,
      R`The second-order behaviour is described by the Hessian matrix: this is the matrix of the quadratic term in the Taylor approximation. We must decide whether this quadratic form is positive in every direction (minimum), negative in every direction (maximum), or has both positive and negative directions (saddle point). In two variables this depends exactly on the sign of the determinant $D=f_{xx}f_{yy}-f_{xy}^2$.`,
      R`If we look for an extremum under a constraint (for example $x+y=10$), at the critical point $\nabla f=0$ no longer holds, since moving along the constraint does not change the function, but its free gradient does. The gradient of the constraint, however, is perpendicular to the admissible direction of motion, so the two gradients must be parallel: $\nabla f=\lambda\nabla g$. This is the whole content of the Lagrange multiplier.`
    ],
    when: 'In optimisation problems: where is the error smallest, where is the yield largest, for which dimensions is the volume maximal with a given surface area. The Hessian test is the multivariable counterpart of curve sketching, and the Lagrange method is the tool for every "maximise under a given constraint" type of exam (ZH) task.',
    theory: [
      { title: 'Local extremum and critical point', body: R`$f$ has a local minimum at $(a,b)$ if in some neighbourhood $f(x,y)\ge f(a,b)$; a local maximum if $f(x,y)\le f(a,b)$. A critical point is one where $\nabla f=0$, or where one of the partial derivatives does not exist.` },
      { title: 'Necessary condition', body: R`If $f$ is differentiable at the interior point $(a,b)$ and has a local extremum there, then $\nabla f(a,b)=(0,0)$. The converse is false: $(0,0)$ is a critical point of $x^2-y^2$, yet it is not an extremum.` },
      { title: 'Hessian test' },
      { title: 'Why the determinant?', body: R`The second-order Taylor approximation is $f(a+h,b+k)\approx f(a,b)+\frac12(f_{xx}h^2+2f_{xy}hk+f_{yy}k^2)$. The quadratic form in the bracket is positive for every $(h,k)\neq(0,0)$ exactly when $f_{xx}>0$ and $f_{xx}f_{yy}-f_{xy}^2>0$; it is negative in every direction when $f_{xx}<0$ and $D>0$. If $D<0$, the quadratic form changes sign, that is, the function increases in one direction and decreases in another.` },
      { title: 'Lagrange multiplier' },
      { title: 'The Lagrange method is only a necessary condition', body: R`Among the solutions of the system $\nabla f=\lambda\nabla g$ there can be a minimum, a maximum and "not an extremum" as well. The points obtained must be classified separately (by comparing function values, or by examining the boundary of the domain separately). On a compact domain the extremum is at an interior critical point or on the boundary, so the boundary must always be checked. It is also necessary that $\nabla g\neq0$ along the constraint.` },
      { title: 'Recommended procedure', items: [
        R`Write down the gradient and solve the system $\nabla f=0$.`,
        R`Compute the second-order derivatives and the determinant $D$ at every critical point.`,
        R`For a constrained problem write down the Lagrangian $L=f-\lambda g$ and solve the system $\nabla L=0$.`,
        R`Compare the function values of the candidate points and check the boundary of the domain.`
      ] }
    ],
    examples: [
      {
        title: 'Minimum by the Hessian test',
        problem: R`Determine the extremum of the function $f(x,y)=x^2+y^2-2x-4y$.`,
        steps: [
          R`Gradient: $\nabla f=(2x-2,\,2y-4)$. The solution of $\nabla f=0$ is $x=1$, $y=2$.`,
          R`Second-order derivatives: $f_{xx}=2$, $f_{yy}=2$, $f_{xy}=0$, so $D=2\cdot2-0=4>0$.`,
          R`Since $D>0$ and $f_{xx}=2>0$, the point is a local minimum.`,
          R`The value of the minimum: $f(1,2)=1+4-2-8=-5$.`,
          R`Completing the square shows the same: $f=(x-1)^2+(y-2)^2-5$, which is never less than $-5$, so this is also a global minimum.`
        ],
        answer: R`Minimum at the point $(1,2)$, value $-5$`
      },
      {
        title: 'Saddle point',
        problem: R`Examine the function $f(x,y)=x^2-y^2$ at the origin.`,
        steps: [
          R`$\nabla f=(2x,-2y)$, which is zero only at the origin, so there is a single critical point.`,
          R`$f_{xx}=2$, $f_{yy}=-2$, $f_{xy}=0$, so $D=2\cdot(-2)-0=-4<0$.`,
          R`$D<0$: the point is a saddle point. This matches the picture: along the $x$-axis $f=x^2$ increases, along the $y$-axis $f=-y^2$ decreases.`,
          R`At the origin $f=0$, but arbitrarily close there are both positive ($x\neq0,y=0$) and negative ($x=0,y\neq0$) values.`
        ],
        answer: R`Saddle point at the origin`
      },
      {
        title: 'Maximum with a fixed sum',
        problem: R`What is the largest value of the product $xy$ if $x+y=10$?`,
        steps: [
          R`The constraint is $g(x,y)=x+y-10=0$. The Lagrange function: $L=xy-\lambda(x+y-10)$.`,
          R`$\partial_xL=y-\lambda=0$ and $\partial_yL=x-\lambda=0$, so $x=y=\lambda$.`,
          R`Substituting into the constraint: $2\lambda=10$, that is $\lambda=5$, so $x=y=5$.`,
          R`The value of the product is $25$. Since $xy\le\left(\frac{x+y}{2}\right)^2=25$ (arithmetic–geometric mean), this is indeed a maximum.`
        ],
        answer: R`$25$, at the point $x=y=5$`
      }
    ],
    mistakes: [
      R`Believing that $\nabla f=0$ automatically means an extremum. A saddle point is also a critical point.`,
      R`Checking only the sign of $f_{xx}$ in the Hessian test: the determinant $D$ is also needed, otherwise a saddle point is mistaken for an extremum.`,
      R`Using $\nabla f=0$ in a constrained problem; the correct condition is $\nabla f=\lambda\nabla g$.`,
      R`Substituting into the constraint and searching for the extremum of the resulting one-variable function — this does work, but without the Lagrange multiplier the structure of the system is lost, and the boundary points are often forgotten as well.`
    ],
    exercises: [
      { q: R`Where is the critical point of the function $f(x,y)=x^2+y^2-2x-4y$?`, hint: R`Solve the system $2x-2=0$, $2y-4=0$.`, sol: R`$x=1$, $y=2$.` },
      { q: R`What is the value of the minimum of the above function?`, hint: R`Substitute the point $(1,2)$.`, sol: R`$f(1,2)=1+4-2-8=-5$.` },
      { q: R`What is the Hessian determinant at the origin for $f(x,y)=x^2-y^2$?`, hint: R`$D=f_{xx}f_{yy}-f_{xy}^2$.`, sol: R`$f_{xx}=2$, $f_{yy}=-2$, $f_{xy}=0$, so $D=-4$.` },
      { q: R`What is the maximum of the product $xy$ if $x+y=10$?`, hint: R`Lagrange, or the arithmetic–geometric mean.`, sol: R`$x=y=5$, the product is $25$.` },
      { q: R`Determine the minimum of $f(x,y)=x^2+y^2$ under the constraint $x+y=4$. Give the value of the minimum.`, hint: R`$\nabla f=(2x,2y)$, $\nabla g=(1,1)$.`, sol: R`$2x=\lambda$, $2y=\lambda\Rightarrow x=y$; from the constraint $x=y=2$, so $f=4+4=8$.` },
      { q: R`At which point does the function $f(x,y)=x^2+y^2-4x+6y+1$ have its minimum?`, hint: R`$2x-4=0$, $2y+6=0$.`, sol: R`$x=2$, $y=-3$; by the Hessian test $D=4>0$, $f_{xx}=2>0$, so it is a minimum. The value of the minimum is $-12$.` },
      { q: R`Prove that if $f$ is smooth and $f$ has a local extremum on the smooth curve $g(x,y)=0$, then at that point $\nabla f$ is parallel to $\nabla g$.`, sol: R`Parametrise the curve around the extremum: $r(t)=(x(t),y(t))$, where $r(0)$ is the point in question and $g(r(t))=0$. Then $t\mapsto f(r(t))$ has an extremum at $t=0$, so $\frac{d}{dt}f(r(t))\big|_{0}=\nabla f\cdot r'(0)=0$. Differentiating the constraint $g(r(t))=0$ gives $\nabla g\cdot r'(0)=0$. Two nonzero vectors perpendicular to the same tangent direction $r'(0)$ in the plane are parallel, so $\nabla f=\lambda\nabla g$ for some $\lambda$.` },
      { q: R`Can an extremum occur at a point where $\nabla f\neq0$?`, choices: ['Yes, if the point lies on the boundary of the domain', 'No, never', 'Yes, it always occurs there'], sol: R`Yes: at interior points $\nabla f=0$ is necessary, but on the boundary of the domain the gradient may be nonzero.` }
    ],
    video: { title: 'Extrema of two-variable functions and the Hessian matrix', channel: 'Hungarian mathematics channels' }
  };

  MB.enContent['tobbvaltozos/tobbvaltozos-integral'] = {
    title: 'Double and triple integrals',
    lead: 'The multiple integral is the same idea as the one-variable one: the sum of infinitely many small pieces. The practical question is how to describe the domain with coordinates in which the bounds are constants — and by how much the area or volume element changes.',
    why: [
      R`The one-dimensional integral starts as a sum of lengths of intervals. In the plane the pieces are small rectangles whose area is $\Delta x\,\Delta y$; in the limit this becomes $dA=dx\,dy$. Fubini's theorem states that if the domain is a rectangle, it is enough to integrate successively: first with respect to $y$ as a function of $x$, then with respect to $x$. This is not trivial, but it is true, and it is what makes the integral computable.`,
      R`For a general domain the bounds of the inner integral may depend on the outer variable: if we "slice" the domain vertically, then for fixed $x$ the variable $y$ runs between a lower and an upper curve. This is exactly what a normal region means, and in practice every task is of this kind.`,
      R`For a circular domain, Cartesian coordinates give square-root bounds, which are hopelessly ugly to integrate. In polar coordinates, however, the circle is $r\le R$, which is constant. The price: the area element is not $dr\,d\varphi$ but $r\,dr\,d\varphi$, because an increase in angle produces an arc length proportional to the radius. This is the role of the Jacobian determinant in cylindrical and spherical symmetry as well.`
    ],
    when: 'When computing area, volume, mass, centre of mass, moment of inertia; in probability theory when integrating a joint density function; in physics when computing flux and work. If the domain is a circle, sphere, cylinder or cone, it is almost always worth changing coordinates.',
    theory: [
      { title: 'Double integral', body: R`The double integral of $f(x,y)$ over a domain $T$ is the limit of the sums $\sum f(x_i,y_i)\Delta A_i$ as the partition is refined. If $f\ge0$, it is the volume under the surface; if $f\equiv1$, it is the area of the domain.` },
      { title: 'Fubini theorem', body: R`If $f$ is continuous on the rectangle $T=[a,b]\times[c,d]$, then
$$\iint_T f\,dA=\int_a^b\left(\int_c^d f(x,y)\,dy\right)dx=\int_c^d\left(\int_a^b f(x,y)\,dx\right)dy.$$` },
      { title: 'Normal region', body: R`A domain $T$ is $x$-normal if $T=\{(x,y):a\le x\le b,\ \alpha(x)\le y\le\beta(x)\}$. Then
$$\iint_T f\,dA=\int_a^b\int_{\alpha(x)}^{\beta(x)}f(x,y)\,dy\,dx.$$
A $y$-normal domain is written the same way with the roles interchanged; the bounds of the inner integral may depend on the outer variable, the outer ones are constants.` },
      { title: 'Polar coordinates' },
      { title: 'Cylindrical and spherical coordinates', note: R`For the sphere $\varphi$ is the polar angle from the $z$-axis ($0\le\varphi\le\pi$), and $\vartheta$ is the azimuth ($0\le\vartheta\le2\pi$).` },
      { title: 'Where does the Jacobian come from?', body: R`In polar coordinates the image of a small rectangle $[r,r+\Delta r]\times[\varphi,\varphi+\Delta\varphi]$ is a circular sector whose area is $\frac12((r+\Delta r)^2-r^2)\Delta\varphi\approx r\,\Delta r\,\Delta\varphi$. That is why $dA=r\,dr\,d\varphi$. In general, under a change of coordinates the area (volume) element is multiplied by the absolute value of the Jacobian determinant: $dA=|\det J|\,du\,dv$.` },
      { title: 'The most common mistakes', body: R`(1) Omitting the Jacobian factor: $\iint e^{-(x^2+y^2)}dx\,dy$ is multiplied by $r$ in polar coordinates, otherwise the result is wrong. (2) Swapping the bounds, or omitting the outer variable from the bounds of the inner integral. (3) Ignoring symmetry: an odd function over a symmetric domain gives zero, which saves a lot of work.` },
      { title: 'Which coordinates?', items: [
        R`Rectangle, triangle, domain between curves: Cartesian.`,
        R`Circle, annulus, circular sector: polar.`,
        R`Cylinder, cone, solid of revolution: cylindrical.`,
        R`Sphere, spherical shell, apex of a cone: spherical.`
      ] }
    ],
    examples: [
      {
        title: 'Double integral over the unit square',
        problem: R`Compute: $\displaystyle\iint_{[0,1]^2}(x^2+y)\,dA$.`,
        steps: [
          R`By Fubini's theorem the order is arbitrary:
$$\int_0^1\left(\int_0^1(x^2+y)\,dy\right)dx.$$`,
          R`Inner integral ($x$ constant): $\int_0^1(x^2+y)\,dy=\left[x^2y+\frac{y^2}{2}\right]_0^1=x^2+\frac12$.`,
          R`Outer integral: $\int_0^1\left(x^2+\frac12\right)dx=\frac13+\frac12=\frac56$.`,
          R`Check with the other order: $\int_0^1\left(\frac13+y\right)dy=\frac13+\frac12=\frac56$.`
        ],
        answer: R`$\dfrac56$`
      },
      {
        title: 'Area of the unit disk in polar coordinates',
        problem: R`Compute the area of the disk $x^2+y^2\le1$.`,
        steps: [
          R`In polar coordinates the domain is $0\le r\le1$, $0\le\varphi\le2\pi$ — both bounds are constant.`,
          R`The area: $\iint_T1\,dA=\int_0^{2\pi}\int_0^1 r\,dr\,d\varphi$.`,
          R`Inner: $\int_0^1r\,dr=\frac12$. Outer: $\int_0^{2\pi}\frac12\,d\varphi=\pi$.`,
          R`The result is $\pi$, which agrees with the geometric formula. If we forgot the Jacobian, we would get $2\pi$ — clearly the factor matters.`
        ],
        answer: R`$\pi$`
      },
      {
        title: 'Gaussian integral in polar coordinates',
        problem: R`Compute: $\displaystyle\iint_{\mathbb R^2}e^{-(x^2+y^2)}\,dA$.`,
        steps: [
          R`In polar coordinates $x^2+y^2=r^2$ and $dA=r\,dr\,d\varphi$, with the domain $0\le r<\infty$, $0\le\varphi\le2\pi$.`,
          R`The integral factors: $\left(\int_0^{2\pi}d\varphi\right)\left(\int_0^\infty e^{-r^2}r\,dr\right)$.`,
          R`The integral with respect to the radius: substitute $u=r^2$, $du=2r\,dr$, so $\int_0^\infty e^{-r^2}r\,dr=\frac12\int_0^\infty e^{-u}du=\frac12$.`,
          R`So the result is $2\pi\cdot\frac12=\pi$. From this it also follows that $\int_{-\infty}^{\infty}e^{-x^2}dx=\sqrt\pi$.`
        ],
        answer: R`$\pi$`
      },
      {
        title: 'Volume of the sphere',
        problem: R`Derive the volume of the sphere of radius $R$.`,
        steps: [
          R`In spherical coordinates the sphere is: $0\le\rho\le R$, $0\le\varphi\le\pi$, $0\le\vartheta\le2\pi$.`,
          R`$V=\int_0^{2\pi}\int_0^{\pi}\int_0^R\rho^2\sin\varphi\,d\rho\,d\varphi\,d\vartheta$.`,
          R`The three integrals split into a product: $\left(\int_0^{2\pi}d\vartheta\right)\left(\int_0^{\pi}\sin\varphi\,d\varphi\right)\left(\int_0^R\rho^2\,d\rho\right)$.`,
          R`Values: $2\pi$, $[-\cos\varphi]_0^\pi=2$, and $\frac{R^3}{3}$.`,
          R`Product: $2\pi\cdot2\cdot\frac{R^3}{3}=\frac{4\pi R^3}{3}$.`
        ],
        answer: R`$V=\dfrac{4\pi R^3}{3}$`
      }
    ],
    mistakes: [
      R`Omitting the Jacobian factor ($r$, or $\rho^2\sin\varphi$) when changing coordinates.`,
      R`Forgetting to substitute the outer variable into the bounds of the inner integral for a normal region.`,
      R`Swapping the roles of the two angles for the sphere: the factor $\sin\varphi$ belongs to the angle measured from the $z$-axis.`,
      R`Integrating an odd function over a symmetric domain the long way instead of writing zero.`
    ],
    exercises: [
      { q: R`What is $\displaystyle\iint_{[0,1]^2}(x+y)\,dA$?`, hint: R`$\int_0^1x\,dx=\frac12$, and the same for $y$.`, sol: R`$\frac12+\frac12=1$.` },
      { q: R`What is the area of the unit disk?`, hint: R`In polar coordinates $\int_0^{2\pi}\int_0^1 r\,dr\,d\varphi$.`, sol: R`$2\pi\cdot\frac12=\pi$.` },
      { q: R`Compute: $\displaystyle\iint_D x\,dA$, where $D=\{(x,y):0\le y\le x\le1\}$.`, hint: R`$\int_0^1\int_0^x x\,dy\,dx$.`, sol: R`$\int_0^1x\cdot x\,dx=\int_0^1x^2dx=\frac13$.` },
      { q: R`Compute: $\displaystyle\iint_D y\,dA$ over the same triangle $D$.`, hint: R`$\int_0^1\int_0^x y\,dy\,dx$.`, sol: R`$\int_0^1\frac{x^2}{2}dx=\frac16$.` },
      { q: R`What is the volume element in spherical coordinates?`, choices: [R`$\rho^2\sin\varphi\,d\rho\,d\varphi\,d\vartheta$`, R`$\rho\sin\varphi\,d\rho\,d\varphi\,d\vartheta$`, R`$\rho^2\,d\rho\,d\varphi\,d\vartheta$`], sol: R`$dV=\rho^2\sin\varphi\,d\rho\,d\varphi\,d\vartheta$, the absolute value of the Jacobian determinant.` },
      { q: R`What is the volume of the sphere of radius $R=2$?`, hint: R`$V=\frac{4\pi R^3}{3}$.`, sol: R`$\frac{4\pi\cdot8}{3}=\frac{32\pi}{3}$.` },
      { q: R`Prove that the area of the unit disk is $\pi$, using the polar area element.`, sol: R`In polar coordinates the disk is $0\le r\le1$, $0\le\varphi\le2\pi$. The area of a small circular sector is $\frac12((r+\Delta r)^2-r^2)\Delta\varphi\approx r\,\Delta r\,\Delta\varphi$, hence $dA=r\,dr\,d\varphi$. Thus the area is $\int_0^{2\pi}\int_0^1r\,dr\,d\varphi=\int_0^{2\pi}\frac12\,d\varphi=\pi$.` },
      { q: R`What is $\displaystyle\iint_{x^2+y^2\le4}e^{-(x^2+y^2)}\,dA$?`, hint: R`In polar coordinates $\int_0^{2\pi}\int_0^2 e^{-r^2}r\,dr\,d\varphi$.`, sol: R`$2\pi\cdot\left[-\frac12e^{-r^2}\right]_0^2=2\pi\cdot\frac{1-e^{-4}}{2}=\pi(1-e^{-4})$.` }
    ],
    video: { title: 'Double and triple integrals, change of coordinates', channel: 'Hungarian mathematics channels' }
  };
})();
