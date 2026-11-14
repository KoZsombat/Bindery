(function () {
  const MB = window.MB;
  const R = String.raw;
  MB.enContent = MB.enContent || {};

  MB.enContent['linearis/vektorok'] = {
    title: 'Vectors, independence, basis',
    lead: 'A vector is not an arrow and not a list of numbers, but an element of a vector space. The computations stay the same, but the concepts (independence, spanning, dimension) only work if you are clear about what they mean.',
    summary: R`Coordinates and geometry of $\mathbb R^n$; linear combinations and the span; linear independence and dependence; basis, coordinates and dimension; the dot product, the norm and angles; the cross product and the area it measures.`,
    why: [
      R`We write the elements of $\mathbb R^n$ as coordinates because that makes computation possible: addition and scalar multiplication work componentwise. Geometrically, however, the same vector is a direction plus a length. The two views do not compete, they complement each other: the coordinate computation gives the result, the geometric picture gives the check. If a vector "cannot be written" from the others, it means that in the coordinate system there is a direction that the given vectors do not cover.`,
      R`Linear combination, span, independence, basis, dimension: all of these are parts of the same question, how much "freedom" a set of vectors provides. Independence means that there is nothing redundant among the vectors; spanning means that no direction is missing. A basis is exactly the case where there is neither redundancy nor a missing direction — this is why every $n$-dimensional space has bases with exactly $n$ elements.`,
      R`The dot product and the cross product provide geometric information in two different ways. The dot product measures the angle and the projection, the cross product measures perpendicularity and area. Both come from the same coordinate operation, so the formula and its meaning should be learned together.`
    ],
    when: 'Before every later chapter: the columns of a matrix are vectors, the solution set of a linear system is a subspace, and the determinant measures exactly independence. The dot product is needed for perpendicularity, the norm, projections and the method of least squares; the cross product for surface normals and torque.',
    theory: [
      {
        title: R`The vector space $\mathbb R^n$`,
        body: R`$\mathbb R^n$ is the set of ordered $n$-tuples of real numbers (a list of $n$ numbers). Addition and scalar multiplication are componentwise:
$$(a_1,\dots,a_n)+(b_1,\dots,b_n)=(a_1+b_1,\dots,a_n+b_n),\qquad \lambda(a_1,\dots,a_n)=(\lambda a_1,\dots,\lambda a_n).$$
The zero vector is $\mathbf 0=(0,\dots,0)$, and $-\mathbf v$ is the vector $(-1)\mathbf v$.`
      },
      {
        title: 'Linear combination, span',
        body: R`A linear combination of the vectors $\mathbf v_1,\dots,\mathbf v_k$ is $\lambda_1\mathbf v_1+\dots+\lambda_k\mathbf v_k$, where $\lambda_i\in\mathbb R$. The set of all such combinations is the span:
$$\operatorname{span}(\mathbf v_1,\dots,\mathbf v_k)=\{\lambda_1\mathbf v_1+\dots+\lambda_k\mathbf v_k:\lambda_i\in\mathbb R\}.$$`
      },
      {
        title: 'Linear independence',
        body: R`The vectors $\mathbf v_1,\dots,\mathbf v_k$ are linearly independent if
$$\lambda_1\mathbf v_1+\dots+\lambda_k\mathbf v_k=\mathbf 0 \quad\Longrightarrow\quad \lambda_1=\dots=\lambda_k=0.$$
Otherwise they are dependent: there is a nontrivial coefficient vector that gives zero, that is, one of the vectors is a combination of the others.`
      },
      {
        title: 'Basis and dimension',
        body: R`The vectors $\mathbf b_1,\dots,\mathbf b_n$ form a basis of the space $V$ if they are linearly independent and span $V$. Then every $\mathbf v\in V$ can be written uniquely in the form $\mathbf v=\lambda_1\mathbf b_1+\dots+\lambda_n\mathbf b_n$; the numbers $\lambda_i$ are the coordinates of $\mathbf v$ in this basis. The number of basis vectors is the dimension, denoted $\dim V$. Every basis has the same number of elements.`
      },
      {
        title: 'Dot product, norm, angle',
        note: 'Two vectors are perpendicular exactly when $\\mathbf u\\cdot\\mathbf v=0$. The dot product is bilinear and symmetric.'
      },
      {
        title: 'Cross product',
        note: R`Defined only in $\mathbb R^3$. Properties: $\mathbf u\times\mathbf v\perp\mathbf u,\mathbf v$; $\|\mathbf u\times\mathbf v\|$ is the area of the parallelogram spanned by them; antisymmetric: $\mathbf v\times\mathbf u=-(\mathbf u\times\mathbf v)$.`
      },
      {
        title: R`Why exactly $n$ basis vectors?`,
        body: R`If $k<n$ vectors span the space, then there is a direction they do not cover; if $k>n$ vectors were independent, that would mean that the $n$-dimensional space has more than $n$ independent directions, which is impossible. Therefore a basis always has exactly $n$ elements, and any $n$ independent vectors automatically form a basis.`
      },
      {
        title: 'The most common misunderstandings',
        body: R`Independence does not mean that the vectors are "not parallel": three vectors can be pairwise non-parallel and still be dependent (they lie in one plane). The single vector $\mathbf 0$ always forms a dependent system, because $1\cdot\mathbf 0=\mathbf 0$. Spanning and independence separately are not a basis: $n$ spanning vectors may be dependent, while $n$ independent vectors always form a basis.`
      }
    ],
    examples: [
      {
        title: 'Dot product and angle',
        problem: R`Compute the dot product of the vectors $\mathbf u=(1,2,3)$ and $\mathbf v=(4,5,6)$, then the cosine of the angle between them.`,
        steps: [
          R`Dot product: $\mathbf u\cdot\mathbf v=1\cdot4+2\cdot5+3\cdot6=4+10+18=32$.`,
          R`Norms: $\|\mathbf u\|=\sqrt{1+4+9}=\sqrt{14}$, $\|\mathbf v\|=\sqrt{16+25+36}=\sqrt{77}$.`,
          R`The angle: $\cos\theta=\dfrac{32}{\sqrt{14}\sqrt{77}}=\dfrac{32}{\sqrt{1078}}\approx0{,}975$.`,
          R`Since $32>0$, the angle is acute; $\theta\approx12{,}9^\circ$.`
        ],
        answer: R`$\mathbf u\cdot\mathbf v=32$, $\cos\theta=\dfrac{32}{\sqrt{1078}}\approx0{,}975$`
      },
      {
        title: 'Cross product',
        problem: R`Compute the cross product of the vectors $\mathbf u=(1,2,3)$ and $\mathbf v=(4,5,6)$.`,
        steps: [
          R`First coordinate: $u_2v_3-u_3v_2=2\cdot6-3\cdot5=12-15=-3$.`,
          R`Second: $u_3v_1-u_1v_3=3\cdot4-1\cdot6=12-6=6$.`,
          R`Third: $u_1v_2-u_2v_1=1\cdot5-2\cdot4=5-8=-3$.`,
          R`Check perpendicularity: $(-3,6,-3)\cdot(1,2,3)=-3+12-9=0$, and $(-3,6,-3)\cdot(4,5,6)=-12+30-18=0$.`
        ],
        answer: R`$\mathbf u\times\mathbf v=(-3,6,-3)$`
      },
      {
        title: 'Testing independence',
        problem: R`Are the vectors $(1,2)$ and $(3,6)$ linearly independent?`,
        steps: [
          R`Write the equation $\lambda(1,2)+\mu(3,6)=(0,0)$ coordinate by coordinate.`,
          R`$\lambda+3\mu=0$ and $2\lambda+6\mu=0$.`,
          R`The second equation is twice the first, so there is only one independent condition: $\lambda=-3\mu$.`,
          R`For example $\mu=1$, $\lambda=-3$ is a nontrivial solution, because $-3(1,2)+(3,6)=(0,0)$. The vectors are dependent: $(3,6)=3\cdot(1,2)$ (they are parallel).`
        ],
        answer: R`Dependent, because $(3,6)=3\cdot(1,2)$`
      },
      {
        title: 'Do the three vectors form a basis?',
        problem: R`Do the vectors $(1,0,0)$, $(1,1,0)$, $(1,1,1)$ form a basis in $\mathbb R^3$?`,
        steps: [
          R`There are three vectors in a three-dimensional space, so it is enough to check independence.`,
          R`From $\lambda_1(1,0,0)+\lambda_2(1,1,0)+\lambda_3(1,1,1)=(0,0,0)$, coordinate by coordinate: third: $\lambda_3=0$; second: $\lambda_2+\lambda_3=0$, so $\lambda_2=0$; first: $\lambda_1+\lambda_2+\lambda_3=0$, so $\lambda_1=0$.`,
          R`Only the trivial solution exists, so the vectors are independent.`,
          R`Hence they form a basis; the determinant of the matrix formed from them is also $1\neq0$, which shows the same.`
        ],
        answer: R`Yes, they form a basis (the determinant is $1$, the vectors are independent)`
      }
    ],
    mistakes: [
      R`Independence is checked by pairwise "non-parallelism"; in fact the equation $\lambda_1\mathbf v_1+\dots+\lambda_k\mathbf v_k=\mathbf 0$ has to be solved.`,
      R`Thinking that any $n$ vectors form a basis in $\mathbb R^n$; independence is also required.`,
      R`Including the vector $\mathbf 0$ in a system believed to be independent — it becomes dependent immediately.`,
      R`Using the cross product in $\mathbb R^2$ or $\mathbb R^4$; it is defined only in $\mathbb R^3$.`
    ],
    exercises: [
      { q: R`What is $(1,2,3)\cdot(4,5,6)$?`, hint: R`Multiply coordinate by coordinate and add.`, sol: R`$4+10+18=32$.` },
      { q: R`What is the length of the vector $(3,4)$?`, hint: R`$\|\mathbf u\|=\sqrt{u_1^2+u_2^2}$.`, sol: R`$\sqrt{9+16}=\sqrt{25}=5$.` },
      { q: R`Give the cross product of the vectors $(1,2,3)$ and $(4,5,6)$.`, hint: R`The formula: $(u_2v_3-u_3v_2,\ u_3v_1-u_1v_3,\ u_1v_2-u_2v_1)$.`, sol: R`$(12-15,\ 12-6,\ 5-8)=(-3,6,-3)$.` },
      { q: R`Are the vectors $(1,2)$ and $(3,6)$ linearly independent?`, choices: ['Yes, they are independent', 'No, they are dependent'], sol: R`No: $(3,6)=3\cdot(1,2)$, hence $-3(1,2)+1(3,6)=(0,0)$ is a nontrivial representation.` },
      { q: R`For which value of $c$ are the vectors $(1,2,3)$, $(0,1,1)$, $(1,c,1)$ linearly dependent?`, hint: R`The determinant is $1\cdot(1-c)-2(0-1)+3(0-1)=-c$.`, sol: R`$\det=-c$, so for $c=0$ the determinant is zero, that is, the vectors are dependent.` },
      { q: R`What angle do the vectors $(1,0)$ and $(1,1)$ enclose? Give it in radians.`, hint: R`$\cos\theta=\frac{1}{1\cdot\sqrt2}$.`, sol: R`$\cos\theta=1/\sqrt2$, so $\theta=\pi/4$.`, altEn: ['45 degrees', '45°'] },
      { q: R`How many dimensions does the subspace $\operatorname{span}((1,0,0),(0,1,0),(2,0,0))$ have?`, hint: R`The third vector is twice the first.`, sol: R`Two independent vectors span it, the third is redundant, so the dimension is $2$.` },
      { q: R`Prove: if $\mathbf u\perp\mathbf v$, then $\|\mathbf u+\mathbf v\|^2=\|\mathbf u\|^2+\|\mathbf v\|^2$.`, hint: R`Write the squared norm using the dot product.`, sol: R`$\|\mathbf u+\mathbf v\|^2=(\mathbf u+\mathbf v)\cdot(\mathbf u+\mathbf v)=\|\mathbf u\|^2+2(\mathbf u\cdot\mathbf v)+\|\mathbf v\|^2$, and $\mathbf u\perp\mathbf v$ implies $\mathbf u\cdot\mathbf v=0$.` }
    ],
    video: { title: 'Essence of linear algebra', channel: '3Blue1Brown' }
  };

  MB.enContent['linearis/matrixok'] = {
    title: 'Matrices, determinant, inverse, Gauss',
    lead: 'A matrix is not a table of numbers but a linear mapping: its columns tell where the basis vectors go. From this single point of view, multiplication, the determinant and the inverse all become meaningful.',
    summary: R`Matrices as linear mappings and the composition rule for multiplication; transpose; determinant as volume distortion and as a measure of independence; the Sarrus rule and cofactor expansion; the inverse of a $2\times2$ matrix; Gaussian elimination, rank and the three solution cases.`,
    why: [
      R`The product $A\mathbf x$ should be read as combining the columns of $A$ with the coordinates: $A\mathbf x=x_1\mathbf a_1+\dots+x_k\mathbf a_k$. Therefore matrix multiplication is not an arbitrary "row-times-column" rule, but the application of two mappings one after the other. This explains why it is not commutative: the order of two mappings matters. This is also why $A(\mathbf x+\mathbf y)=A\mathbf x+A\mathbf y$ holds — this is the definition of linearity.`,
      R`The determinant is the volume-distortion factor of the mapping: $|\det A|$ is the volume multiplier of the parallelepiped, the sign indicates orientation. If $\det A=0$, the mapping "squashes" one dimension, that is, its image is not full-dimensional and it is not invertible. This is why $\det A\neq0$ exactly when $A$ is invertible, and why the homogeneous system has only the trivial solution exactly in that case. The determinant is not a magic formula but a measure of independence.`,
      R`Gaussian elimination consists of three elementary row operations, and each of them preserves the solution set of the system and also the determinant (the third one, a row swap, changes its sign). This is why the system can be transformed into echelon form and solved from there by back substitution. The number of nonzero rows in echelon form is the rank: that many independent conditions, the remaining rows are redundant. From this picture the three cases (one solution, infinitely many, no solution) are immediately visible.`
    ],
    when: 'Linear systems are always solved by Gaussian elimination, because it is faster and more stable than Cramer rule. The determinant is needed mainly when computing invertibility, eigenvalues, or the cross product/area. Matrix multiplication is needed for composition of mappings, for the adjacency matrix in graph theory, and for the iterations of numerical methods.',
    theory: [
      {
        title: 'Matrix and multiplication',
        body: R`An $m\times n$ matrix has $m$ rows and $n$ columns. The product $AB$ is defined only if the number of columns of $A$ equals the number of rows of $B$; then $(AB)_{ij}=\sum_k a_{ik}b_{kj}$. It is not commutative: $AB\neq BA$ in general.`
      },
      {
        title: 'Matrix as a mapping',
        note: R`The columns of the matrix are the images of the basis vectors. Multiplication is composition of mappings: in $(AB)\mathbf x$ the mapping $B$ acts first.`
      },
      {
        title: 'Transpose',
        note: 'Transposition reverses the order of the factors in a product.'
      },
      {
        title: 'Determinant',
        note: R`In the $2\times2$ case the formula is direct. For $3\times3$ use cofactor expansion: multiply the entries of a row (or column) by the corresponding signed minors.`
      },
      {
        title: 'Sarrus rule',
        body: R`In the three-by-three case we subtract the sum of the three "anti-diagonal" products from the sum of the three "main-diagonal" products:
$$\det\begin{pmatrix}a&b&c\\d&e&f\\g&h&i\end{pmatrix}=aei+bfg+cdh-ceg-bdi-afh.$$
In four or more dimensions this pattern does not work; there you need expansion or row operations.`
      },
      {
        title: R`Inverse of a $2\times2$ matrix`,
        note: R`It exists only if $ad-bc\neq0$. Check: $AA^{-1}=I$.`
      },
      {
        title: 'Gaussian elimination and the solution cases',
        body: R`Elementary row operations performed on the augmented matrix: row swap; multiplying a row by a nonzero constant; adding a scalar multiple of one row to another. From the echelon form:
$$\text{rank}=\text{number of leading entries}.$$
If the rank is smaller than the number of unknowns AND the system is consistent, there are infinitely many solutions; if the rank of the augmented matrix is larger, there is no solution.`
      },
      {
        title: 'Where most students go wrong',
        body: R`Cramer rule can be used only if the determinant is nonzero — otherwise we divide by zero. When computing a determinant, the alternating signs ($+,-,+$) are often left out during expansion. Row operations can change the determinant, so if we compute a determinant we should record the changes; as far as the solution set is concerned, however, row operations are safe.`
      }
    ],
    examples: [
      {
        title: 'Matrix multiplication',
        problem: R`Compute $AB$, where $A=\begin{pmatrix}1&2\\3&4\end{pmatrix}$, $B=\begin{pmatrix}0&1\\1&0\end{pmatrix}$.`,
        steps: [
          R`First row, first column: $1\cdot0+2\cdot1=2$.`,
          R`First row, second column: $1\cdot1+2\cdot0=1$.`,
          R`Second row, first column: $3\cdot0+4\cdot1=4$.`,
          R`Second row, second column: $3\cdot1+4\cdot0=3$.`,
          R`Hence $AB=\begin{pmatrix}2&1\\4&3\end{pmatrix}$. Check: $B$ swaps the columns, and indeed $AB$ is exactly $A$ with its columns swapped.`
        ],
        answer: R`$AB=\begin{pmatrix}2&1\\4&3\end{pmatrix}$`
      },
      {
        title: 'A three-by-three determinant',
        problem: R`Compute $\det\begin{pmatrix}1&2&3\\4&5&6\\7&8&10\end{pmatrix}$.`,
        steps: [
          R`Expansion along the first row, signs $+,-,+$:`,
          R`$1\cdot\det\begin{pmatrix}5&6\\8&10\end{pmatrix}-2\cdot\det\begin{pmatrix}4&6\\7&10\end{pmatrix}+3\cdot\det\begin{pmatrix}4&5\\7&8\end{pmatrix}$.`,
          R`The three minors: $50-48=2$; $40-42=-2$; $32-35=-3$.`,
          R`Substituting: $1\cdot2-2\cdot(-2)+3\cdot(-3)=2+4-9=-3$.`
        ],
        answer: R`$-3$`
      },
      {
        title: 'Computing an inverse',
        problem: R`Find the inverse of the matrix $A=\begin{pmatrix}2&5\\1&3\end{pmatrix}$.`,
        steps: [
          R`Determinant: $\det A=2\cdot3-5\cdot1=6-5=1$.`,
          R`The inverse formula: $\frac{1}{\det A}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$.`,
          R`Substituting: $A^{-1}=\frac11\begin{pmatrix}3&-5\\-1&2\end{pmatrix}=\begin{pmatrix}3&-5\\-1&2\end{pmatrix}$.`,
          R`Check: $A A^{-1}=\begin{pmatrix}2\cdot3+5\cdot(-1)&2\cdot(-5)+5\cdot2\\1\cdot3+3\cdot(-1)&1\cdot(-5)+3\cdot2\end{pmatrix}=\begin{pmatrix}1&0\\0&1\end{pmatrix}$.`
        ],
        answer: R`$A^{-1}=\begin{pmatrix}3&-5\\-1&2\end{pmatrix}$`
      },
      {
        title: 'A system with three unknowns',
        problem: R`Solve: $x+y+z=6$, $2x+y-z=1$, $x+2y+3z=14$.`,
        steps: [
          R`Subtract twice the first row from the second: $-y-3z=-11$.`,
          R`Subtract the first row from the third: $y+2z=8$.`,
          R`Adding the two new equations gives $-z=-3$, so $z=3$.`,
          R`Back substitution: $y=8-2\cdot3=2$.`,
          R`From the first equation $x=6-2-3=1$. Check with the second: $2+2-3=1$.`
        ],
        answer: R`$(x,y,z)=(1,2,3)$`
      }
    ],
    mistakes: [
      R`Swapping the order in matrix multiplication: $AB\neq BA$; and in transposition $(AB)^T=B^TA^T$, not $A^TB^T$.`,
      R`Leaving out the alternating signs ($+,-,+$) in a cofactor expansion.`,
      R`Placing the signs wrongly in the inverse formula: in the matrix $\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$ the two diagonal entries are not swapped.`,
      R`Trying to compute an inverse when $\det A=0$; correctly: there is no inverse then, the matrix is singular.`
    ],
    exercises: [
      { q: R`Compute: $\begin{pmatrix}1&2\\3&4\end{pmatrix}\begin{pmatrix}2&0\\0&3\end{pmatrix}$. Give the $(2,1)$ entry!`, hint: R`Second row, first column: $3\cdot2+4\cdot0$.`, sol: R`$3\cdot2+4\cdot0=6$. The full product is $\begin{pmatrix}2&6\\6&12\end{pmatrix}$.` },
      { q: R`What is $\det\begin{pmatrix}1&2\\3&4\end{pmatrix}$?`, hint: R`$ad-bc$.`, sol: R`$1\cdot4-2\cdot3=4-6=-2$.` },
      { q: R`What is $\det\begin{pmatrix}1&2&3\\4&5&6\\7&8&10\end{pmatrix}$?`, hint: R`Expansion along the first row: $+,-,+$.`, sol: R`$1(50-48)-2(40-42)+3(32-35)=2+4-9=-3$.` },
      { q: R`What is the top-left entry of the inverse of the matrix $A=\begin{pmatrix}2&5\\1&3\end{pmatrix}$?`, hint: R`$\det A=1$, and the inverse is $\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$.`, sol: R`$A^{-1}=\begin{pmatrix}3&-5\\-1&2\end{pmatrix}$, so the top-left entry is $3$.` },
      { q: R`Solve: $x+y+z=6$, $2x+y-z=1$, $x+2y+3z=14$. What is $z$?`, hint: R`Subtract twice the first row from the second.`, sol: R`The solution is $(1,2,3)$, so $z=3$.` },
      { q: R`What is the rank of the matrix $\begin{pmatrix}1&2&3\\2&4&6\\1&1&1\end{pmatrix}$?`, hint: R`The second row is twice the first.`, sol: R`One row is redundant, the remaining two rows are independent, so the rank is $2$.` },
      { q: R`For which value of $k$ is the matrix $\begin{pmatrix}1&2\\2&k\end{pmatrix}$ singular?`, hint: R`$\det A=k-4$.`, sol: R`$k-4=0$, so $k=4$.` },
      { q: R`Prove that if $A$ and $B$ are invertible, then $AB$ is also invertible, and $(AB)^{-1}=B^{-1}A^{-1}$.`, hint: R`Multiply $AB$ by $B^{-1}A^{-1}$ and check both sides.`, sol: R`$(AB)(B^{-1}A^{-1})=A(BB^{-1})A^{-1}=AA^{-1}=I$, and likewise $(B^{-1}A^{-1})(AB)=I$. The two-sided inverse is unique, hence $(AB)^{-1}=B^{-1}A^{-1}$.` }
    ],
    video: { title: 'Essence of linear algebra', channel: '3Blue1Brown' }
  };

  MB.enContent['linearis/sajatertek'] = {
    title: 'Eigenvalues, eigenvectors, diagonalization',
    lead: 'An eigenvector is a direction that the mapping does not rotate, only stretches. The eigenvalue is the amount of stretching. If there are enough such directions, a change of basis makes the matrix diagonal.',
    summary: 'Eigenvalues and eigenvectors from $A\\mathbf v=\\lambda\\mathbf v$; the characteristic polynomial $\\det(A-\\lambda I)=0$; computing eigenspaces; diagonalization $A=PDP^{-1}$; the trace/determinant sanity checks; matrices that cannot be diagonalized and real matrices with complex eigenvalues.',
    why: [
      R`The action of a matrix $A$ usually rotates and stretches every vector. There are, however, distinguished directions along which only the length changes: these are the eigenvectors. The equation $A\mathbf v=\lambda\mathbf v$ expresses this. Looking at the system along such a direction, the mapping becomes multiplication by a single number, which is much simpler: this is why the eigendecomposition is useful in differential equations, vibration analysis and numerical methods (for example PageRank or PCA).`,
      R`The characteristic polynomial comes from the condition $\det(A-\lambda I)=0$: a nontrivial solution exists exactly when the matrix is singular. Hence the eigenvalues are the roots of the determinant. Two quick checks are always available: the sum of the eigenvalues is the trace, their product is the determinant. These are not tricks, but the meaning of the coefficients of the characteristic polynomial (Viete formulas).`,
      R`Diagonalization means replacing the basis by the eigenvectors. In this basis the matrix of the mapping is diagonal, so $A^k=P D^k P^{-1}$ is easy to compute. This possibility is not always available, however: $n$ independent eigenvectors are needed. If there are fewer (for example in the case of a Jordan block), the matrix is not diagonalizable, but the eigenvalues still exist.`
    ],
    when: 'Eigenvalue computation is needed for linear recurrences and systems of differential equations, for stability analysis (where the behaviour of the solution is decided by $|\\lambda|$), for the spectral study of graphs and for dimension reduction in machine learning. The ZH (midterm) typically asks for the eigenvalues and eigenvectors of a 2x2 or 3x3 matrix, and for the question of diagonalizability.',
    theory: [
      {
        title: 'Eigenvalue and eigenvector',
        body: R`Let $A$ be an $n\times n$ real matrix. The number $\lambda$ is an eigenvalue of $A$ if there is a vector $\mathbf v\neq\mathbf 0$ such that
$$A\mathbf v=\lambda\mathbf v.$$
Such vectors $\mathbf v$ are called eigenvectors belonging to $\lambda$. The eigenspace belonging to $\lambda$ is $E_\lambda=\ker(A-\lambda I)$, which always contains the zero vector, but an eigenvector is by definition not the zero vector.`
      },
      {
        title: 'Characteristic polynomial',
        note: R`The left-hand side is a polynomial of degree $n$ in $\lambda$. Its roots are the eigenvalues, counted with multiplicity.`
      },
      {
        title: 'Computing the eigenspace',
        body: R`After substituting $\lambda$, solve the homogeneous system $(A-\lambda I)\mathbf v=\mathbf 0$. Since $\det(A-\lambda I)=0$, there is a nontrivial solution: the solution vectors form a subspace, and a basis of it gives the eigenvectors.`
      },
      {
        title: 'Diagonalization',
        note: R`The columns of $P$ are the eigenvectors. This is possible exactly when there are $n$ linearly independent eigenvectors (for example when all eigenvalues are distinct, or when the dimension of every eigenspace equals its multiplicity).`
      },
      {
        title: 'Trace and determinant check',
        note: 'If the sum or the product of the computed eigenvalues does not match, we made a mistake in the characteristic polynomial or in the roots.'
      },
      {
        title: 'Not every matrix is diagonalizable',
        body: R`The matrix $\begin{pmatrix}1&1\\0&1\end{pmatrix}$ has only one eigenvalue ($\lambda=1$), and its eigenspace is one-dimensional: there are no two independent eigenvectors, so it is not diagonalizable. Such a matrix has a Jordan form. The existence of eigenvalues therefore does not guarantee diagonalizability.`
      },
      {
        title: 'Real matrix, complex eigenvalues',
        body: R`The characteristic polynomial of the matrix $\begin{pmatrix}0&-1\\1&0\end{pmatrix}$ is $\lambda^2+1$, so its eigenvalues are $\pm i$. A real matrix can also have complex eigenvalues; these come in conjugate pairs, and in the real sense the matrix is not diagonalizable (it describes a rotation).`
      }
    ],
    examples: [
      {
        title: 'Eigenvalues of a symmetric matrix',
        problem: R`Find the eigenvalues and eigenvectors of the matrix $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$.`,
        steps: [
          R`Characteristic polynomial: $\det(A-\lambda I)=\det\begin{pmatrix}2-\lambda&1\\1&2-\lambda\end{pmatrix}=(2-\lambda)^2-1$.`,
          R`Zeros: $(2-\lambda)^2=1$, that is $2-\lambda=\pm1$, so $\lambda_1=1$, $\lambda_2=3$.`,
          R`Check: $\lambda_1+\lambda_2=4=\operatorname{tr}A$, $\lambda_1\lambda_2=3=\det A$.`,
          R`$\lambda=1$: $(A-I)\mathbf v=0$ gives $\begin{pmatrix}1&1\\1&1\end{pmatrix}\begin{pmatrix}v_1\\v_2\end{pmatrix}=0$, that is $v_1+v_2=0$: $\mathbf v=(1,-1)$.`,
          R`$\lambda=3$: $\begin{pmatrix}-1&1\\1&-1\end{pmatrix}\mathbf v=0$ gives $v_1=v_2$: $\mathbf v=(1,1)$.`
        ],
        answer: R`$\lambda_1=1$: $\mathbf v=(1,-1)$; $\lambda_2=3$: $\mathbf v=(1,1)$`
      },
      {
        title: 'Computing eigenvalues',
        problem: R`Find the eigenvalues and eigenvectors of the matrix $A=\begin{pmatrix}4&1\\2&3\end{pmatrix}$.`,
        steps: [
          R`$\det(A-\lambda I)=(4-\lambda)(3-\lambda)-2=\lambda^2-7\lambda+10$.`,
          R`$\lambda^2-7\lambda+10=(\lambda-5)(\lambda-2)$, so $\lambda_1=5$, $\lambda_2=2$.`,
          R`Check: $5+2=7=\operatorname{tr}A$; $5\cdot2=10=\det A=12-2$.`,
          R`$\lambda=5$: $\begin{pmatrix}-1&1\\2&-2\end{pmatrix}\mathbf v=0$ gives $-v_1+v_2=0$, so $\mathbf v=(1,1)$.`,
          R`$\lambda=2$: $\begin{pmatrix}2&1\\2&1\end{pmatrix}\mathbf v=0$ gives $2v_1+v_2=0$, so $\mathbf v=(1,-2)$.`
        ],
        answer: R`$\lambda=5$: $(1,1)$; $\lambda=2$: $(1,-2)$`
      },
      {
        title: 'Diagonalization',
        problem: R`Diagonalize the matrix $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$.`,
        steps: [
          R`The eigenvalues are $1$ and $3$, the eigenvectors $(1,-1)$ and $(1,1)$ — these are independent, because neither is a scalar multiple of the other.`,
          R`The columns of $P$ are the eigenvectors: $P=\begin{pmatrix}1&1\\-1&1\end{pmatrix}$.`,
          R`$\det P=2$, so $P^{-1}=\frac12\begin{pmatrix}1&-1\\1&1\end{pmatrix}$.`,
          R`Then $P^{-1}AP=\begin{pmatrix}1&0\\0&3\end{pmatrix}=D$, which can be checked with the equality $AP=PD$.`
        ],
        answer: R`$A=PDP^{-1}$ with the choice $P=\begin{pmatrix}1&1\\-1&1\end{pmatrix}$, $D=\begin{pmatrix}1&0\\0&3\end{pmatrix}$`
      }
    ],
    mistakes: [
      R`Writing the characteristic polynomial with the wrong sign instead of $\det(\lambda I-A)$; the roots are the same, but leaving out the factor $(-1)^n$ causes confusion.`,
      R`Giving the zero vector as an eigenvector — by definition an eigenvector is not zero.`,
      R`Thinking that every matrix is diagonalizable; $n$ independent eigenvectors are needed for that.`,
      R`Skipping the trace/determinant check, although a single computation filters out wrong eigenvalues.`
    ],
    exercises: [
      { q: R`What is the sum of the eigenvalues of the matrix $\begin{pmatrix}2&1\\1&2\end{pmatrix}$?`, hint: R`The sum is the trace.`, sol: R`$\operatorname{tr}A=2+2=4$; the eigenvalues are $1$ and $3$.` },
      { q: R`What is the larger eigenvalue of the matrix $\begin{pmatrix}4&1\\2&3\end{pmatrix}$?`, hint: R`$\lambda^2-7\lambda+10=0$.`, sol: R`$(\lambda-5)(\lambda-2)=0$, the larger one is $5$.` },
      { q: R`Give the eigenvector of the matrix $\begin{pmatrix}4&1\\2&3\end{pmatrix}$ belonging to $\lambda=5$.`, hint: R`Solve the system $(A-5I)\mathbf v=0$.`, sol: R`$\begin{pmatrix}-1&1\\2&-2\end{pmatrix}\mathbf v=0\Rightarrow v_1=v_2$, so $(1,1)$ (any nonzero scalar multiple).` },
      { q: R`What is the product of the eigenvalues of the matrix $\begin{pmatrix}1&1\\0&2\end{pmatrix}$?`, hint: R`For a triangular matrix the eigenvalues are the diagonal entries.`, sol: R`$\lambda=1,2$, the product is $2$ (it equals the determinant).` },
      { q: R`Is the matrix $\begin{pmatrix}1&1\\0&1\end{pmatrix}$ diagonalizable?`, choices: ['Yes', 'No'], sol: R`No: there is only one eigenvalue ($\lambda=1$), and the eigenspace is one-dimensional, so there are no two independent eigenvectors.` },
      { q: R`What is the determinant of the matrix $\begin{pmatrix}1&0&0\\2&3&0\\4&5&6\end{pmatrix}$?`, hint: R`The determinant of a triangular matrix is the product of the diagonal.`, sol: R`$\det=1\cdot3\cdot6=18$, the eigenvalues are $1,3,6$, their product is $18$.` },
      { q: R`Prove that the eigenvalues of a triangular matrix are exactly the diagonal entries.`, hint: R`Write down $\det(A-\lambda I)$ in triangular form.`, sol: R`If $A$ is upper triangular, then $A-\lambda I$ is too, with diagonal entries $a_{ii}-\lambda$. The determinant of a triangular matrix is the product of the diagonal, so $\det(A-\lambda I)=\prod_i(a_{ii}-\lambda)$, whose roots are $\lambda=a_{ii}$.` },
      { q: R`For the matrix $\begin{pmatrix}2&0\\0&3\end{pmatrix}$, what is the trace of $A^{10}$?`, hint: R`Raising a diagonal matrix to a power is done entrywise.`, sol: R`$A^{10}=\operatorname{diag}(2^{10},3^{10})$, so the trace is $2^{10}+3^{10}=1024+59049=60073$.` }
    ],
    video: { title: 'Eigenvalues, eigenvectors, diagonalization', channel: 'Hungarian maths channels' }
  };
})();
