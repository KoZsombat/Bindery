(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['komplex/komplex-algebra'] = {
    title: 'Algebraic form and operations',
    lead: R`A complex number has the form $a+bi$, where $i^2=-1$. Every operation works with the same two rules you already know from real numbers: we add term by term, and we multiply every term by every term — we just replace $i^2$ by $-1$.`,
    why: [
      R`Over the real numbers the equation $x^2=-1$ has no solution, because the square of any real number is non-negative. If we still want a solution, we have to extend the number concept. In the complex numbers we add exactly one new "direction": the number $i$, for which $i^2=-1$. Everything else already follows from this single definition — no separate rules have to be introduced.`,
      R`The computational rules arise naturally while you use them. Addition works term by term, because the real and imaginary parts are independent directions. When multiplying we simply expand the brackets and replace the resulting $i^2$ by $-1$. A complex number in the denominator is handled by expanding with its conjugate: this is the trick that makes the denominator real, exactly as $\frac{1}{\sqrt2}$ is turned into $\frac{\sqrt2}{2}$.`
    ],
    when: R`The basis of every complex problem: if a formula contains $i$, it must first be brought to the form $a+bi$. The modulus is needed for convergence tests (complex series), the conjugate for clearing the denominator and for studying the roots of polynomials with real coefficients. In the ZH (Hungarian midterm) division and powers come up most often, but estimates with the modulus are also standard.`,
    theory: [
      {
        title: 'The complex number and the algebraic form',
        body: R`The set of complex numbers is $\mathbb C=\{a+bi \mid a,b\in\mathbb R\}$, where $i^2=-1$. The number $a$ is the real part ($\operatorname{Re}z$), the number $b$ is the imaginary part ($\operatorname{Im}z$). Two complex numbers are equal exactly when both their real and their imaginary parts agree: $a+bi=c+di\iff a=c$ and $b=d$. Therefore a single complex equation is really two real equations.`
      },
      {
        title: 'Addition and multiplication',
        note: R`Multiplication comes from expanding the brackets, then substituting $i^2=-1$ and $i^3=-i$.`
      },
      {
        title: 'Conjugate',
        body: R`The conjugate of $z=a+bi$ is $\bar z=a-bi$. Its properties: $\overline{z+w}=\bar z+\bar w$, $\overline{zw}=\bar z\cdot\bar w$, $z+\bar z=2a$, $z-\bar z=2bi$, and $z\bar z=a^2+b^2$ is a real, non-negative number.`
      },
      {
        title: 'Modulus',
        note: R`The modulus is the distance from the origin, so it is always a non-negative real number.`
      },
      {
        title: 'Division',
        note: R`We expand by the conjugate of the denominator; the denominator thereby becomes $|c+di|^2$, which is real.`
      },
      {
        title: 'Powers of $i$ and periodicity',
        body: R`$i^1=i$, $i^2=-1$, $i^3=-i$, $i^4=1$, and from there it repeats. Therefore the value of $i^n$ depends only on the remainder of $n\bmod 4$: $i^{4k}=1$, $i^{4k+1}=i$, $i^{4k+2}=-1$, $i^{4k+3}=-i$. The most common mistake: taking $i^2$ to be $1$ instead of $-1$, or forgetting the period $4$.`
      },
      {
        title: 'Geometric meaning',
        body: R`We picture the number $z=a+bi$ as the point $(a,b)$ of the plane (or as the vector starting at the origin). Addition is vector addition. Conjugation is reflection in the $x$-axis. The modulus is the distance from the origin: $|z-w|$ is the distance between two complex numbers. Multiplication is not that simple, but 3.2 shows what it does: it multiplies lengths and rotates angles.`
      },
      {
        title: 'Worth knowing by heart',
        items: [
          R`$i^2=-1$, so $i^3=-i$ and $i^4=1$.`,
          R`$z\bar z=|z|^2$ is real and non-negative; hence $|z|=\sqrt{z\bar z}$.`,
          R`$\overline{z+w}=\bar z+\bar w$ and $\overline{zw}=\bar z\bar w$.`,
          R`$|zw|=|z||w|$ and $\left|\frac zw\right|=\frac{|z|}{|w|}$ (if $w\neq0$).`
        ]
      }
    ],
    examples: [
      {
        title: 'Multiplication in algebraic form',
        problem: R`Compute: $(3+2i)(1-4i)$.`,
        steps: [
          R`Expand the brackets: $3\cdot1+3\cdot(-4i)+2i\cdot1+2i\cdot(-4i)$.`,
          R`The terms: $3-12i+2i-8i^2$.`,
          R`Use $i^2=-1$, so $-8i^2=+8$.`,
          R`Real part: $3+8=11$; imaginary part: $-12+2=-10$.`
        ],
        answer: R`$11-10i$`
      },
      {
        title: 'Division by the conjugate',
        problem: R`Compute: $\dfrac{1+i}{2-i}$.`,
        steps: [
          R`The conjugate of the denominator is $2+i$; we expand by it.`,
          R`Numerator: $(1+i)(2+i)=2+i+2i+i^2=1+3i$.`,
          R`Denominator: $(2-i)(2+i)=4-i^2=5$, which is real.`,
          R`So the quotient is $\frac{1+3i}{5}=\frac15+\frac35 i$.`
        ],
        answer: R`$\dfrac{1+3i}{5}$`
      },
      {
        title: 'Modulus and geometry',
        problem: R`What is $|3+4i|$, and what does it mean in the plane?`,
        steps: [
          R`$|3+4i|=\sqrt{3^2+4^2}=\sqrt{9+16}=\sqrt{25}=5$.`,
          R`This is the distance of the point $(3,4)$ from the origin (the $3$–$4$–$5$ Pythagorean triangle).`,
          R`Check with the conjugate: $z\bar z=(3+4i)(3-4i)=9+16=25=|z|^2$.`
        ],
        answer: R`$|3+4i|=5$`
      },
      {
        title: 'Powers of $i$',
        problem: R`What is $i^{100}$ and $i^{2023}$?`,
        steps: [
          R`The period is $4$, so only the remainder of the exponent modulo $4$ matters.`,
          R`$100=4\cdot25$, therefore $i^{100}=(i^4)^{25}=1^{25}=1$.`,
          R`$2023=4\cdot505+3$, therefore $i^{2023}=i^3=-i$.`
        ],
        answer: R`$i^{100}=1$, $i^{2023}=-i$`
      }
    ],
    mistakes: [
      R`Taking $i^2$ to be $1$ instead of $-1$ — this ruins the sign of every product.`,
      R`Writing $|z|=a^2+b^2$: the modulus is a square root, so $|z|=\sqrt{a^2+b^2}$.`,
      R`Dividing term by term by the denominator: $\frac{a+bi}{c+di}\neq\frac ac+\frac bd i$. The correct route is expansion by the conjugate.`,
      R`Writing $\sqrt{-4}=-2$: an even root of a real number is non-negative, here $\sqrt{-4}=2i$.`
    ],
    exercises: [
      { q: R`Compute: $(2+3i)+(4-i)$.`, hint: R`Real part to the real part, imaginary part to the imaginary part.`, sol: R`$(2+4)+(3-1)i=6+2i$.` },
      { q: R`Compute: $(1+2i)(3-i)$.`, hint: R`Expand the brackets, then use $i^2=-1$.`, sol: R`$3-i+6i-2i^2=3+5i+2=5+5i$.` },
      { q: R`What is $|1-i\sqrt3|$?`, hint: R`$|a+bi|=\sqrt{a^2+b^2}$, here $b=-\sqrt3$.`, sol: R`$\sqrt{1+3}=2$.` },
      { q: R`What is $i^{2023}$?`, hint: R`Divide the exponent by $4$ and look at the remainder.`, sol: R`$2023=4\cdot505+3$, therefore $i^{2023}=i^3=-i$.` },
      { q: R`Compute: $\dfrac{3+i}{1-i}$.`, hint: R`Expand by the conjugate of the denominator, $1+i$.`, sol: R`$\frac{(3+i)(1+i)}{2}=\frac{3+3i+i+i^2}{2}=\frac{2+4i}{2}=1+2i$.` },
      { q: R`Solve in $\mathbb C$: $z+2\bar z=3+i$.`, hint: R`Write $z=x+yi$; you get two real equations.`, sol: R`$z+2\bar z=(x+2x)+(y-2y)i=3x-yi$. From this $3x=3$ and $-y=1$, so $x=1$, $y=-1$, that is $z=1-i$.` },
      { q: R`Prove that $|zw|=|z||w|$ for all $z,w\in\mathbb C$.`, hint: R`Use the identity $|u|^2=u\bar u$ and the multiplication rule for conjugates.`, sol: R`$|zw|^2=(zw)\overline{(zw)}=zw\bar z\bar w=(z\bar z)(w\bar w)=|z|^2|w|^2$. Since both sides are non-negative, taking square roots gives $|zw|=|z||w|$.` },
      { q: R`What is $\dfrac1i$?`, choices: [R`$i$`, R`$-i$`, R`$1$`, R`$-1$`], hint: R`Expand by $-i$, or use $i\cdot(-i)=1$.`, sol: R`$\frac1i=\frac{1\cdot(-i)}{i\cdot(-i)}=\frac{-i}{-i^2}=\frac{-i}{1}=-i$.` }
    ],
    video: { title: 'Complex numbers', channel: 'Magyar matematika', note: 'Playlist' }
  };

  MB.enContent['komplex/komplex-trig'] = {
    title: 'Trigonometric form, Euler, roots',
    lead: R`The form $z=a+bi$ is good for addition, but awkward for multiplication and powers. The trigonometric form $z=r(\cos\varphi+i\sin\varphi)$ shows exactly what happens in a product: the lengths multiply and the angles add.`,
    why: [
      R`Every non-zero point of the plane can be given by its length and the angle it makes with the real axis. This is the trigonometric form $z=r(\cos\varphi+i\sin\varphi)$, where $r=|z|$ and $\varphi$ is the argument. With it the product rule becomes an addition theorem: $r_1r_2(\cos(\varphi_1+\varphi_2)+i\sin(\varphi_1+\varphi_2))$. Multiplication is therefore stretching and rotation at once — which makes taking powers trivial.`,
      R`Euler's formula $e^{i\varphi}=\cos\varphi+i\sin\varphi$ records this fact compactly: $z=re^{i\varphi}$. With it complex multiplication becomes adding exponents, and taking powers becomes multiplying exponents: $(re^{i\varphi})^n=r^ne^{in\varphi}$. This is de Moivre's theorem, and it is the single formula you need for root extraction. For $n$-th roots you only have to notice that the angle is determined only up to multiples of $2\pi$, hence there are $n$ different roots, forming a regular $n$-gon.`
    ],
    when: R`Indispensable for powers and roots: computing $(1+i)^{10}$ in algebraic form is eight multiplications, while in trigonometric form it takes two lines. Complex equations ($z^3=8$, $z^4=-4$), roots of polynomials with real coefficients and the residue theorem all need this form. When determining the argument, however, you must watch the quadrant: for $x<0$ the value $\arctan(y/x)$ alone is wrong.`,
    theory: [
      {
        title: 'Argument and trigonometric form',
        body: R`If $z=a+bi\neq0$, then $r=|z|=\sqrt{a^2+b^2}>0$ and $\varphi$ is the angle for which $a=r\cos\varphi$, $b=r\sin\varphi$. Then $z=r(\cos\varphi+i\sin\varphi)$ is the trigonometric form. The angle $\varphi$ is not uniquely determined: any $\varphi+2k\pi$ works as well. The value lying in $[0,2\pi)$ (or $(-\pi,\pi]$) is called the principal value.`
      },
      {
        title: 'The quadrant trap',
        body: R`The expression $\arctan\frac ba$ gives a correct angle only in the interval $(-\frac\pi2,\frac\pi2)$, that is only for $a>0$. If $a<0$, you must add $\pi$ to (or subtract $\pi$ from) the value obtained, because the point lies in the second or third quadrant. For example, for $z=-1+i$ we get $\arctan(-1)=-\frac\pi4$, which is wrong; the correct argument is $\pi-\frac\pi4=\frac{3\pi}{4}$. Always draw a picture, or check the signs of $\cos\varphi$ and $\sin\varphi$!`
      },
      {
        title: 'Euler formula and exponential form',
        note: R`From this, $\cos\varphi=\frac{e^{i\varphi}+e^{-i\varphi}}2$ and $\sin\varphi=\frac{e^{i\varphi}-e^{-i\varphi}}{2i}$.`
      },
      {
        title: "De Moivre's theorem",
        note: R`The proof is repeated application of the addition theorem; in exponential form $(re^{i\varphi})^n=r^ne^{in\varphi}$.`
      },
      {
        title: '$n$-th roots',
        note: R`There are exactly $n$ roots; each of them lies on the same circle of radius $\sqrt[n]{r}$, forming a regular $n$-gon.`
      },
      {
        title: 'Theorem on conjugate pairs of roots',
        body: R`If the coefficients of the polynomial $P(z)=a_nz^n+\dots+a_0$ are real and $P(z_0)=0$, then $P(\bar z_0)=0$ holds as well. This is true because $\overline{z^k}=\bar z^k$ and for real coefficients $\overline{a_kz^k}=a_k\bar z^k$, hence $P(\bar z)=\overline{P(z)}=0$.`
      },
      {
        title: 'Rotation and stretching',
        body: R`Multiplication by the number $w=re^{i\varphi}$ stretches the plane by the factor $r$ and rotates it by $\varphi$. That is why multiplying by $i$ is a rotation by $90^\circ$: $i(a+bi)=-b+ai$. The $n$-th roots lie on a regular polygon because a rotation by the angle $\frac{2\pi}{n}$ maps the set of roots onto itself.`
      },
      {
        title: 'Notable arguments',
        items: [
          R`$1$: $\varphi=0$; $-1$: $\varphi=\pi$; $i$: $\varphi=\frac\pi2$; $-i$: $\varphi=-\frac\pi2$.`,
          R`$1+i$: $\varphi=\frac\pi4$ (first quadrant); $-1+i$: $\varphi=\frac{3\pi}4$ (second).`,
          R`$-1-i$: $\varphi=\frac{5\pi}4$ or $-\frac{3\pi}4$ (third quadrant).`,
          R`$1-i$: $\varphi=-\frac\pi4$ or $\frac{7\pi}4$ (fourth quadrant).`
        ]
      }
    ],
    examples: [
      {
        title: 'Trigonometric form and powers',
        problem: R`Write $z=1+i$ in trigonometric form and compute $z^4$.`,
        steps: [
          R`$r=|1+i|=\sqrt{1+1}=\sqrt2$.`,
          R`The argument: $\arctan(1)=\frac\pi4$, and the point lies in the first quadrant, so $\varphi=\frac\pi4$.`,
          R`$z=\sqrt2\left(\cos\frac\pi4+i\sin\frac\pi4\right)=\sqrt2\,e^{i\pi/4}$.`,
          R`De Moivre: $z^4=(\sqrt2)^4\left(\cos\pi+i\sin\pi\right)=4\cdot(-1)=-4$.`,
          R`Check in algebraic form: $(1+i)^2=2i$, so $(1+i)^4=(2i)^2=-4$.`
        ],
        answer: R`$z=\sqrt2\,e^{i\pi/4}$, $z^4=-4$`
      },
      {
        title: 'Argument in the second quadrant',
        problem: R`Give the modulus and the argument of $z=-1+i$.`,
        steps: [
          R`$r=\sqrt{(-1)^2+1^2}=\sqrt2$.`,
          R`$a=-1<0$, so the value $\arctan\frac{b}{a}=\arctan(-1)=-\frac\pi4$ is not correct on its own.`,
          R`The point lies in the second quadrant ($a<0$, $b>0$), so $\varphi=\pi-\frac\pi4=\frac{3\pi}4$.`,
          R`Check: $\cos\frac{3\pi}4=-\frac{\sqrt2}{2}$, $\sin\frac{3\pi}4=\frac{\sqrt2}{2}$, and multiplying by $\sqrt2$ gives $(-1,1)$.`
        ],
        answer: R`$|z|=\sqrt2$, $\arg z=\frac{3\pi}4$`
      },
      {
        title: 'Third roots: $z^3=8$',
        problem: R`Solve: $z^3=8$.`,
        steps: [
          R`The trigonometric form of the right-hand side: $8=8(\cos0+i\sin0)$, so $r=8$, $\varphi=0$.`,
          R`The roots: $z_k=\sqrt[3]{8}\left(\cos\frac{0+2k\pi}{3}+i\sin\frac{0+2k\pi}{3}\right)=2\left(\cos\frac{2k\pi}{3}+i\sin\frac{2k\pi}{3}\right)$.`,
          R`$k=0$: $z_0=2(\cos0+i\sin0)=2$.`,
          R`$k=1$: $z_1=2\left(\cos\frac{2\pi}{3}+i\sin\frac{2\pi}{3}\right)=2\left(-\frac12+\frac{\sqrt3}{2}i\right)=-1+i\sqrt3$.`,
          R`$k=2$: $z_2=2\left(\cos\frac{4\pi}{3}+i\sin\frac{4\pi}{3}\right)=-1-i\sqrt3$.`,
          R`The three roots form an equilateral triangle on the circle of radius $2$.`
        ],
        answer: R`$z\in\{2,\ -1+i\sqrt3,\ -1-i\sqrt3\}$`
      },
      {
        title: 'Negative discriminant',
        problem: R`Solve: $z^2+2z+5=0$.`,
        steps: [
          R`The quadratic formula: $z=\frac{-2\pm\sqrt{4-20}}{2}=\frac{-2\pm\sqrt{-16}}{2}$.`,
          R`$\sqrt{-16}=4i$, because $(4i)^2=16i^2=-16$.`,
          R`Thus $z=\frac{-2\pm4i}{2}=-1\pm2i$.`,
          R`Check with the theorem on conjugate pairs of roots: the coefficients are real, so the two roots are conjugates of each other — this holds.`
        ],
        answer: R`$z=-1+2i$ or $z=-1-2i$`
      }
    ],
    mistakes: [
      R`Using the formula $\arctan\frac ba$ in every quadrant: for $a<0$ you must add $\pi$.`,
      R`Putting the number itself in place of the modulus in the trigonometric form: $1+i\neq\cos\frac\pi4+i\sin\frac\pi4$, because the length is $\sqrt2$.`,
      R`Writing down only the branch $k=0$ for $n$-th roots: $z^3=8$ has three roots.`,
      R`Using the conjugate root pair theorem without real coefficients: it is false for polynomials with complex coefficients.`
    ],
    exercises: [
      { q: R`What is the argument of $z=\sqrt3+i$ in radians?`, hint: R`$\tan\varphi=\frac{1}{\sqrt3}$, and the point lies in the first quadrant.`, sol: R`$\tan\varphi=\frac{1}{\sqrt3}\Rightarrow\varphi=\frac\pi6$, because $a>0$, $b>0$.` },
      { q: R`What is the argument of $z=-2i$?`, hint: R`The point lies on the negative imaginary axis.`, sol: R`$a=0$, $b=-2<0$, therefore $\varphi=-\frac\pi2$ (or $\frac{3\pi}2$).` },
      { q: R`Compute: $(1+i)^8$.`, hint: R`$1+i=\sqrt2\,e^{i\pi/4}$, then de Moivre.`, sol: R`$(1+i)^8=(\sqrt2)^8e^{i2\pi}=16\cdot1=16$.` },
      { q: R`What is the real root of the equation $z^3=-8$?`, hint: R`$-8=8e^{i\pi}$; the real root lies on the negative real axis.`, sol: R`The roots are: $2e^{i\pi/3}=1+i\sqrt3$, $2e^{i\pi}=-2$, $2e^{i5\pi/3}=1-i\sqrt3$. The real root is $-2$.` },
      { q: R`Compute: $(1-i)^{10}$.`, hint: R`$1-i=\sqrt2\,e^{-i\pi/4}$, and in the exponent $10\cdot(-\frac\pi4)=-\frac{5\pi}2$.`, sol: R`$(1-i)^{10}=(\sqrt2)^{10}e^{-i5\pi/2}=32e^{-i\pi/2}=-32i$.` },
      { q: R`Solve: $z^2+4z+13=0$. Give the roots.`, altEn: [R`-2+3i and -2-3i`, R`-2+3i, -2-3i`], hint: R`The discriminant is $16-52=-36$.`, sol: R`$z=\frac{-4\pm6i}{2}=-2\pm3i$.` },
      { q: R`Prove that for every $n\in\mathbb N$, $(\cos\varphi+i\sin\varphi)^n=\cos n\varphi+i\sin n\varphi$.`, hint: R`Induction on $n$, using the addition theorem.`, sol: R`For $n=1$ it is an identity. If it holds for $n$, then $(\cos\varphi+i\sin\varphi)^{n+1}=(\cos n\varphi+i\sin n\varphi)(\cos\varphi+i\sin\varphi)$. Expanding the product and applying the addition theorems for $\cos(A+B)$ and $\sin(A+B)$ gives $\cos(n+1)\varphi+i\sin(n+1)\varphi$.` },
      { q: R`How many $n$-th roots does a complex number $z\neq0$ have?`, choices: [R`$1$`, R`$2$`, R`$n$`, R`$n-1$`], hint: R`The angle is determined only up to multiples of $2k\pi$, and $k=0,\dots,n-1$ gives the different roots.`, sol: R`Exactly $n$, because $n$ consecutive values of $k$ give distinct angles modulo $2\pi$.` }
    ],
    video: { title: 'Complex numbers', channel: 'Magyar matematika', note: 'Playlist' }
  };
})();
