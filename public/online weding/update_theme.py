import re

with open('style.css', 'r') as f:
    css = f.read()

# 1. Variables
css = css.replace('var(--gold-primary): #C5A059;', 'var(--gold-primary): #B7935B;') # Will fix with regex
css = re.sub(r'--gold-primary:\s*#[A-Fa-f0-9]+;', '--gold-primary: #B7935B;', css)
css = re.sub(r'--gold-light:\s*#[A-Fa-f0-9]+;', '--gold-light: #D4B98C;', css)
css = re.sub(r'--dark-bg:\s*#[A-Fa-f0-9]+;', '--dark-bg: #FFFFFF;', css)
css = re.sub(r'--dark-surface:\s*#[A-Fa-f0-9]+;', '--dark-surface: #F8F9FA;', css)
css = re.sub(r'--text-main:\s*#[A-Fa-f0-9]+;', '--text-main: #333333;', css)
css = re.sub(r'--text-muted:\s*#[A-Fa-f0-9]+;', '--text-muted: #777777;', css)
css = css.replace('/* Color Variables - Balinese Premium Theme (Gold, Earthy Dark) */', '/* Color Variables - Balinese Clean White Theme (Gold, White) */')

# 2. Buttons
css = css.replace('color: #111;', 'color: #FFFFFF;')

# 3. Glassmorphism
css = css.replace('background: rgba(34, 34, 34, 0.6);', 'background: rgba(255, 255, 255, 0.8);\n    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);')
css = css.replace('border: 1px solid rgba(197, 160, 89, 0.2);', 'border: 1px solid rgba(255, 255, 255, 0.5);')

# 4. Cover Section
css = css.replace('background: linear-gradient(rgba(21, 21, 21, 0.4), rgba(21, 21, 21, 0.6)), url(\'assets/images/sampul.jpg\') center/cover;', 'background: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(\'assets/images/sampul.jpg\') center/cover;')

# 5. Text Shadows
css = css.replace('text-shadow: 0 4px 15px rgba(0,0,0,0.5);', 'text-shadow: 1px 1px 5px rgba(255,255,255,0.8);')
css = css.replace('text-shadow: 2px 2px 10px rgba(0,0,0,0.8);', 'text-shadow: 1px 1px 5px rgba(255,255,255,0.8);')

# 6. Hero Section
css = css.replace('background: linear-gradient(rgba(0,0,0,0.4), rgba(21, 21, 21, 1)), url(\'assets/images/hero-bg.jpg\') center/cover no-repeat;', 'background: linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,1)), url(\'assets/images/hero-bg.jpg\') center/cover no-repeat;')

# 7. Ornaments shadow
css = css.replace('filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));', 'filter: drop-shadow(0 5px 15px rgba(0,0,0,0.15));')

# 8. Background wrappers
css = css.replace('background: linear-gradient(rgba(21, 21, 21, 0.85), rgba(21, 21, 21, 0.95)), url(\'assets/images/couple-bg.jpg\') center/cover fixed;', 'background: linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95)), url(\'assets/images/couple-bg.jpg\') center/cover fixed;')
css = css.replace('background: linear-gradient(rgba(21, 21, 21, 0.85), rgba(21, 21, 21, 0.95)), url(\'assets/images/event-bg.jpg\') center/cover fixed;', 'background: linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95)), url(\'assets/images/event-bg.jpg\') center/cover fixed;')

# 9. RSVP form
css = css.replace('background: rgba(0,0,0,0.4);', 'background: rgba(255,255,255,0.8);')
css = css.replace('border: 1px solid rgba(197, 160, 89, 0.4);', 'border: 1px solid rgba(183, 147, 91, 0.4);')
css = css.replace('background: rgba(0,0,0,0.6);', 'background: rgba(255,255,255,1);')

# 10. Footer
css = css.replace('background: #0f0f0f;', 'background: #F8F9FA;')
css = css.replace('border-top: 1px solid rgba(197, 160, 89, 0.2);', 'border-top: 1px solid rgba(183, 147, 91, 0.2);')

# 11. Countdown
css = css.replace('background: rgba(0, 0, 0, 0.5);', 'background: rgba(255, 255, 255, 0.7);\n    box-shadow: 0 4px 15px rgba(0,0,0,0.05);')

# 12. Falling flower shadow
css = css.replace('filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4));', 'filter: drop-shadow(0 2px 5px rgba(0,0,0,0.15));')

# 13. Smoke opacity (make it softer for light bg)
css = css.replace('opacity: 0.4;\n    filter: blur(8px);\n    mix-blend-mode: screen;', 'opacity: 0.2;\n    filter: blur(8px);\n    mix-blend-mode: normal;')

with open('style.css', 'w') as f:
    f.write(css)

print("CSS updated successfully.")
