var R = String.raw;
function F(cat, name, latex, note, ref) { MB.formulas.push({ cat: cat, name: name, latex: latex, note: note, ref: ref }); }

/* Alapok */
F('Alapok', 'Hatványszabályok', R`x^a x^b=x^{a+b},\quad \frac{x^a}{x^b}=x^{a-b},\quad (x^a)^b=x^{ab}`, 'Csak pozitív alap mellett biztonságos a törtkitevő.', ['alapok', 'algebra']);
F('Alapok', 'Törtkitevő', R`\sqrt[n]{x^m}=x^{m/n}`, 'Páros gyöknél $x\ge0$.', ['alapok', 'algebra']);
F('Alapok', 'Logaritmus definíció', R`\log_a b=c \iff a^c=b`, '$a>0$, $a\neq1$, $b>0$.', ['alapok', 'algebra']);
F('Alapok', 'Logaritmus-azonosságok', R`\ln(AB)=\ln A+\ln B,\quad \ln\frac AB=\ln A-\ln B,\quad \ln A^k=k\ln A`, 'Csak pozitív argumentumra.', ['alapok', 'algebra']);
F('Alapok', 'Alapátszámítás', R`\log_a b=\frac{\ln b}{\ln a}`, '', ['alapok', 'algebra']);
F('Alapok', 'Nevezetes szorzatok', R`a^2-b^2=(a-b)(a+b),\quad a^3\pm b^3=(a\pm b)(a^2\mp ab+b^2)`, '', ['alapok', 'algebra']);
F('Alapok', 'Trigonometrikus alap', R`\sin^2\alpha+\cos^2\alpha=1,\quad \tan\alpha=\frac{\sin\alpha}{\cos\alpha}`, '', ['alapok', 'trigonometria']);
F('Alapok', 'Addíciós tételek', R`\sin(\alpha\pm\beta)=\sin\alpha\cos\beta\pm\cos\alpha\sin\beta`, '', ['alapok', 'trigonometria']);
F('Alapok', 'Kétszeres szög', R`\sin2\alpha=2\sin\alpha\cos\alpha,\quad \cos2\alpha=\cos^2\alpha-\sin^2\alpha`, '', ['alapok', 'trigonometria']);
F('Alapok', 'Másodfokú megoldóképlet', R`x_{1,2}=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`, '', ['alapok', 'egyenletek']);
F('Alapok', 'Viète-formulák', R`x_1+x_2=-\frac ba,\quad x_1x_2=\frac ca`, '', ['alapok', 'egyenletek']);
F('Alapok', 'Abszolútérték-távolság', R`|x-a|<\varepsilon \iff a-\varepsilon<x<a+\varepsilon`, 'A határérték-definíciók alapja.', ['alapok', 'egyenletek']);
F('Alapok', 'Háromszög-egyenlőtlenség', R`|a+b|\le|a|+|b|`, '', ['alapok', 'egyenletek']);

/* Logika */
F('Logika', 'Kvantorok tagadása', R`\neg(\forall x:P(x))\iff\exists x:\neg P(x)`, 'A kvantor megfordul, a belső állítás tagadódik.', ['logika', 'halmazok-logika']);
F('Logika', 'De Morgan', R`\neg(A\land B)\iff\neg A\lor\neg B`, '', ['logika', 'halmazok-logika']);
F('Logika', 'Implikáció tagadása', R`\neg(A\Rightarrow B)\iff A\land\neg B`, '', ['logika', 'halmazok-logika']);
F('Logika', 'Kontrapozíció', R`(A\Rightarrow B)\iff(\neg B\Rightarrow\neg A)`, '', ['logika', 'halmazok-logika']);
F('Logika', 'Logikai szita', R`|A\cup B|=|A|+|B|-|A\cap B|`, '', ['logika', 'halmazok-logika']);

/* Komplex */
F('Komplex számok', 'Algebrai alak', R`z=a+bi,\quad \bar z=a-bi,\quad |z|=\sqrt{a^2+b^2}`, '', ['komplex', 'komplex-algebra']);
F('Komplex számok', 'Osztás', R`\frac{a+bi}{c+di}=\frac{(a+bi)(c-di)}{c^2+d^2}`, 'A nevező konjugáltjával bővítünk.', ['komplex', 'komplex-algebra']);
F('Komplex számok', 'Trigonometrikus alak', R`z=r(\cos\varphi+i\sin\varphi),\quad r=|z|`, '', ['komplex', 'komplex-trig']);
F('Komplex számok', 'Euler-formula', R`e^{i\varphi}=\cos\varphi+i\sin\varphi`, '', ['komplex', 'komplex-trig']);
F('Komplex számok', 'Moivre-tétel', R`z^n=r^n(\cos n\varphi+i\sin n\varphi)`, '', ['komplex', 'komplex-trig']);
F('Komplex számok', 'n-edik gyökök', R`z_k=\sqrt[n]{r}\left(\cos\frac{\varphi+2k\pi}{n}+i\sin\frac{\varphi+2k\pi}{n}\right)`, '$k=0,\dots,n-1$.', ['komplex', 'komplex-trig']);
F('Komplex számok', 'Konjugált gyökpár', R`P(z)=0\Rightarrow P(\bar z)=0`, 'Valós együtthatós polinomnál.', ['komplex', 'komplex-trig']);

/* Sorozatok */
F('Sorozatok', 'Konvergencia', R`\forall\varepsilon>0\ \exists N\ \forall n>N:\ |a_n-A|<\varepsilon`, '', ['sorozatok', 'sorozat-konvergencia']);
F('Sorozatok', 'Műveletek határértékkel', R`a_n\to A,\ b_n\to B\Rightarrow a_n\pm b_n\to A\pm B,\ a_nb_n\to AB`, 'Osztásnál $B\neq0$.', ['sorozatok', 'sorozat-konvergencia']);
F('Sorozatok', 'Rendőrelv', R`a_n\le c_n\le b_n,\ a_n\to L,\ b_n\to L\Rightarrow c_n\to L`, '', ['sorozatok', 'sorozat-limitszamitas']);
F('Sorozatok', 'Nevezetes határérték', R`\left(1+\frac xn\right)^n\to e^x`, '', ['sorozatok', 'sorozat-nevezetes']);
F('Sorozatok', 'Nagyságrendek', R`\ln n\ll n^k\ll a^n\ll n!\ll n^n`, '$a>1$, $k>0$.', ['sorozatok', 'sorozat-nevezetes']);
F('Sorozatok', 'Gyökös határérték', R`\sqrt[n]{n}\to1,\quad \sqrt[n]{c}\to1\ (c>0)`, '', ['sorozatok', 'sorozat-nevezetes']);

/* Határérték */
F('Függvényhatárérték', 'ε–δ definíció', R`\lim_{x\to a}f(x)=L\iff\forall\varepsilon>0\ \exists\delta>0:\ 0<|x-a|<\delta\Rightarrow|f(x)-L|<\varepsilon`, '', ['hatarertek', 'fuggveny-hatarertek']);
F('Függvényhatárérték', 'Folytonosság', R`f\ \text{folytonos }a\text{-ban}\iff\lim_{x\to a}f(x)=f(a)`, '', ['hatarertek', 'fuggveny-hatarertek']);
F('Függvényhatárérték', 'Nevezetes határértékek', R`\lim_{x\to0}\frac{\sin x}{x}=1,\quad \lim_{x\to0}\frac{e^x-1}{x}=1,\quad \lim_{x\to0}\frac{\ln(1+x)}{x}=1`, '', ['hatarertek', 'fuggveny-nevezetes']);
F('Függvényhatárérték', 'Ferde aszimptota', R`y=mx+b,\quad m=\lim_{x\to\infty}\frac{f(x)}x,\quad b=\lim_{x\to\infty}(f(x)-mx)`, '', ['hatarertek', 'fuggveny-nevezetes']);
F('Függvényhatárérték', 'Átviteli elv', R`f(x)\to L\ (x\to a)\iff f(x_n)\to L\ \text{minden }x_n\to a,\ x_n\neq a\ \text{sorozatra}`, '', ['hatarertek', 'fuggveny-hatarertek']);

/* Deriválás */
F('Deriválás', 'Derivált definíció', R`f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}h`, '', ['derivalas', 'derivalt-definicio']);
F('Deriválás', 'Érintő egyenlete', R`y=f(x_0)+f'(x_0)(x-x_0)`, '', ['derivalas', 'derivalt-definicio']);
F('Deriválás', 'Összeg és konstans', R`(cf)'=cf',\quad (f\pm g)'=f'\pm g'`, '', ['derivalas', 'derivalt-szabalyok']);
F('Deriválás', 'Szorzat és hányados', R`(fg)'=f'g+fg',\quad \left(\frac fg\right)'=\frac{f'g-fg'}{g^2}`, '', ['derivalas', 'derivalt-szabalyok']);
F('Deriválás', 'Láncszabály', R`[f(g(x))]'=f'(g(x))\,g'(x)`, '', ['derivalas', 'derivalt-szabalyok']);
F('Deriválás', 'Alapderiváltak', R`(x^n)'=nx^{n-1},\ (e^x)'=e^x,\ (\ln x)'=\frac1x`, '', ['derivalas', 'derivalt-szabalyok']);
F('Deriválás', 'Trigonometrikus deriváltak', R`(\sin x)'=\cos x,\quad (\cos x)'=-\sin x,\quad (\tan x)'=\frac1{\cos^2x}`, '', ['derivalas', 'derivalt-szabalyok']);
F('Deriválás', 'Inverz függvény deriváltja', R`(f^{-1})'(y)=\frac1{f'(x)},\quad y=f(x)`, '', ['derivalas', 'derivalt-inverz']);
F('Deriválás', 'Implicit deriválás', R`F(x,y)=0\Rightarrow y'=-\frac{F_x}{F_y}`, '', ['derivalas', 'derivalt-inverz']);
F('Deriválás', 'Paraméteres derivált', R`\frac{dy}{dx}=\frac{y'(t)}{x'(t)}`, '', ['derivalas', 'derivalt-inverz']);
F('Deriválás', "L'Hôpital-szabály", R`\lim\frac{f(x)}{g(x)}=\lim\frac{f'(x)}{g'(x)}`, 'Csak $0/0$ vagy $\infty/\infty$ alaknál.', ['derivalas', 'derivalt-fuggvenyvizsgalat']);
F('Deriválás', 'Monotonitás', R`f'>0\Rightarrow f\ \text{nő},\quad f'<0\Rightarrow f\ \text{csökken}`, '', ['derivalas', 'derivalt-fuggvenyvizsgalat']);
F('Deriválás', 'Konvexitás', R`f''>0\Rightarrow\text{konvex},\quad f''<0\Rightarrow\text{konkáv}`, '', ['derivalas', 'derivalt-fuggvenyvizsgalat']);

/* Integrálás */
F('Integrálás', 'Alapintegrálok', R`\int x^n dx=\frac{x^{n+1}}{n+1}+C,\quad \int\frac1x dx=\ln|x|+C`, '$n\neq-1$.', ['integralas', 'integral-alap']);
F('Integrálás', 'Exponenciális és trigonometrikus', R`\int e^{ax}dx=\frac{e^{ax}}a+C,\quad \int\sin(ax)dx=-\frac{\cos(ax)}a+C`, '', ['integralas', 'integral-alap']);
F('Integrálás', 'Helyettesítés', R`\int f(g(x))g'(x)\,dx=\int f(u)\,du,\quad u=g(x)`, '', ['integralas', 'integral-alap']);
F('Integrálás', 'Parciális integrálás', R`\int f g' = fg-\int f'g`, '', ['integralas', 'integral-parcialis']);
F('Integrálás', 'Newton–Leibniz', R`\int_a^b f(x)\,dx=F(b)-F(a)`, "$F'=f$.", ['integralas', 'integral-hatarozott']);
F('Integrálás', 'Terület', R`A=\int_a^b |f(x)-g(x)|\,dx`, '', ['integralas', 'integral-hatarozott']);
F('Integrálás', 'Forgástest térfogata', R`V=\pi\int_a^b f(x)^2\,dx`, '$x$-tengely körüli forgatás.', ['integralas', 'integral-hatarozott']);
F('Integrálás', 'Improprius integrál', R`\int_1^\infty \frac{dx}{x^p}=\frac1{p-1}\ (p>1)`, '$p\le1$ esetén divergens.', ['integralas', 'integral-hatarozott']);

/* Sorok */
F('Sorok', 'Geometriai sor', R`\sum_{n=0}^\infty q^n=\frac1{1-q}\quad(|q|<1)`, '', ['sorok', 'sorok-alap']);
F('Sorok', 'Konvergencia szükséges feltétele', R`\sum a_n\ \text{konvergens}\Rightarrow a_n\to0`, 'Fordítva nem igaz: $\sum1/n$ divergens.', ['sorok', 'sorok-alap']);
F('Sorok', 'p-sor', R`\sum_{n=1}^\infty\frac1{n^p}\ \text{konvergens}\iff p>1`, '', ['sorok', 'sorok-kriteriumok']);
F('Sorok', 'Hányadoskritérium', R`\lim\left|\frac{a_{n+1}}{a_n}\right|=q<1\Rightarrow\text{konvergens}`, '', ['sorok', 'sorok-kriteriumok']);
F('Sorok', 'Gyökkritérium', R`\lim\sqrt[n]{|a_n|}=q<1\Rightarrow\text{konvergens}`, '', ['sorok', 'sorok-kriteriumok']);
F('Sorok', 'Leibniz-sor', R`c_n\searrow0\Rightarrow\sum(-1)^n c_n\ \text{konvergens}`, '', ['sorok', 'sorok-leibniz']);
F('Sorok', 'Leibniz-hiba', R`|s-s_n|\le c_{n+1}`, '', ['sorok', 'sorok-leibniz']);

/* Taylor */
F('Taylor-sorok', 'Taylor-polinom', R`T_n(x)=\sum_{k=0}^n\frac{f^{(k)}(a)}{k!}(x-a)^k`, '', ['taylor', 'taylor-polinom']);
F('Taylor-sorok', 'Lagrange-maradék', R`R_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-a)^{n+1}`, '', ['taylor', 'taylor-polinom']);
F('Taylor-sorok', 'Nevezetes sorok', R`e^x=\sum\frac{x^n}{n!},\quad \sin x=\sum\frac{(-1)^n x^{2n+1}}{(2n+1)!}`, '', ['taylor', 'taylor-sorok']);
F('Taylor-sorok', 'Binomiális sor', R`(1+x)^\alpha=\sum_{k=0}^\infty\binom{\alpha}{k}x^k`, '$|x|<1$.', ['taylor', 'taylor-sorok']);

/* Többváltozós */
F('Többváltozós', 'Gradiens', R`\nabla f=(f_x,f_y)`, 'A legnagyobb növekedés iránya.', ['tobbvaltozos', 'tobbvaltozos-derivalt']);
F('Többváltozós', 'Érintősík', R`z=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)`, '', ['tobbvaltozos', 'tobbvaltozos-derivalt']);
F('Többváltozós', 'Iránymenti derivált', R`D_{\mathbf u}f=\nabla f\cdot\mathbf u`, '$\mathbf u$ egységvektor.', ['tobbvaltozos', 'tobbvaltozos-derivalt']);
F('Többváltozós', 'Hesse-determináns', R`D=f_{xx}f_{yy}-f_{xy}^2`, '', ['tobbvaltozos', 'tobbvaltozos-szelsoseg']);
F('Többváltozós', 'Lagrange-multiplikátor', R`\nabla f=\lambda\nabla g`, 'Feltételes szélsőérték $g(x,y)=0$ mellett.', ['tobbvaltozos', 'tobbvaltozos-szelsoseg']);
F('Többváltozós', 'Polárkoordináta', R`x=r\cos\varphi,\ y=r\sin\varphi,\ dA=r\,dr\,d\varphi`, '', ['tobbvaltozos', 'tobbvaltozos-integral']);
F('Többváltozós', 'Hengerkoordináta', R`x=r\cos\varphi,\ y=r\sin\varphi,\ z=z,\ dV=r\,dr\,d\varphi\,dz`, '', ['tobbvaltozos', 'tobbvaltozos-integral']);
F('Többváltozós', 'Gömbkoordináta', R`dV=\rho^2\sin\varphi\,d\rho\,d\varphi\,d\vartheta`, '', ['tobbvaltozos', 'tobbvaltozos-integral']);

/* Diff/Fourier */
F('Differenciálegyenletek', 'Szeparábilis', R`\frac{dy}{dx}=f(x)g(y)\Rightarrow\int\frac{dy}{g(y)}=\int f(x)dx`, '', ['diff-fourier', 'diffegyenletek']);
F('Differenciálegyenletek', 'Elsőrendű lineáris', R`y'+p(x)y=q(x)\Rightarrow y=e^{-\int p}\left(\int q e^{\int p}dx+C\right)`, '', ['diff-fourier', 'diffegyenletek']);
F('Differenciálegyenletek', 'Lineáris rekurzió', R`a_n=pa_{n-1}+qa_{n-2}\Rightarrow \lambda^2=p\lambda+q`, 'A karakterisztikus egyenlet gyökei adják a megoldást.', ['diff-fourier', 'diffegyenletek']);
F('Fourier-sorok', 'Fourier-együtthatók', R`a_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\cos(nx)dx,\quad b_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\sin(nx)dx`, '', ['diff-fourier', 'fourier']);
F('Fourier-sorok', 'Fourier-sor', R`f(x)\sim\frac{a_0}2+\sum_{n=1}^\infty(a_n\cos nx+b_n\sin nx)`, '', ['diff-fourier', 'fourier']);

/* Lineáris algebra */
F('Lineáris algebra', 'Skaláris szorzat', R`u\cdot v=u_1v_1+u_2v_2+u_3v_3=|u||v|\cos\theta`, '', ['linearis', 'vektorok']);
F('Lineáris algebra', 'Vektoriális szorzat', R`u\times v=(u_2v_3-u_3v_2,\ u_3v_1-u_1v_3,\ u_1v_2-u_2v_1)`, '', ['linearis', 'vektorok']);
F('Lineáris algebra', 'Determináns 2×2', R`\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc`, '', ['linearis', 'matrixok']);
F('Lineáris algebra', 'Inverz 2×2', R`\begin{pmatrix}a&b\\c&d\end{pmatrix}^{-1}=\frac1{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}`, '', ['linearis', 'matrixok']);
F('Lineáris algebra', 'Determináns szorzás', R`\det(AB)=\det A\cdot\det B`, '', ['linearis', 'matrixok']);
F('Lineáris algebra', 'Sajátérték', R`Av=\lambda v,\quad \det(A-\lambda I)=0`, '', ['linearis', 'sajatertek']);
F('Lineáris algebra', 'Nyom és determináns', R`\sum\lambda_i=\operatorname{tr}A,\quad\prod\lambda_i=\det A`, '', ['linearis', 'sajatertek']);

/* Diszkrét */
F('Diszkrét matematika', 'Kongruencia', R`a\equiv b\pmod m\iff m\mid(a-b)`, '', ['diszkret', 'szamelmelet']);
F('Diszkrét matematika', 'Kis Fermat-tétel', R`a^{p-1}\equiv1\pmod p\quad(p\nmid a)`, '', ['diszkret', 'szamelmelet']);
F('Diszkrét matematika', 'Binomiális együttható', R`\binom nk=\frac{n!}{k!(n-k)!}`, '', ['diszkret', 'szamelmelet']);
F('Diszkrét matematika', 'Binomiális tétel', R`(a+b)^n=\sum_{k=0}^n\binom nk a^{n-k}b^k`, '', ['diszkret', 'szamelmelet']);
F('Diszkrét matematika', 'Kézfogás-tétel', R`\sum_{v\in V}d(v)=2|E|`, '', ['diszkret', 'grafok']);
F('Diszkrét matematika', 'Fa élszáma', R`n\ \text{csúcsú fa}\Rightarrow |E|=n-1`, '', ['diszkret', 'grafok']);
