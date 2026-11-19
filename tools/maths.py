import sys
from qlib import Bank, table, bar, line, svg

B = Bank('maths', 'm')
D, P, X = 'diagnostic', 'practice', 'mock'
K, A, R = 'knowledge', 'application', 'reasoning'

# ---------------------------------------------------------------- place value
t = 'm-place'
B.add(D, t, K, 1, 'write', 'What is the value of the digit 7 in 3 472 615?',
      options=['70 000', '7000', '700 000', '7'],
      mistakes={'7000': 'Counted place values from the wrong end', '700 000': 'Shifted one place too far left', '7': 'Gave the digit, not its value'},
      hint='Name the column of each digit, starting from the ones on the right.',
      explain='3 472 615 = 3 millions, 4 hundred thousands, 7 ten thousands … so the 7 is worth 70 000.')
B.add(D, t, A, 2, 'round', 'Round 6.849 to one decimal place.', answer=6.8,
      mistakes={6.9: 'Rounded up because of the 9 instead of looking at the hundredths digit', 6.85: 'Rounded to two decimal places'},
      hint='Look only at the digit in the hundredths place to decide.',
      explain='The hundredths digit is 4, which is less than 5, so round down: 6.849 → 6.8.')
B.add(P, t, K, 1, 'write', 'Write the number forty thousand and sixty in figures.', answer=40060,
      mistakes={4060: 'Missed out a zero placeholder', 400060: 'Added an extra zero'},
      hint='Forty thousand is 40 000. Then add sixty.', explain='40 000 + 60 = 40 060. The hundreds column is empty, so it needs a 0 placeholder.')
B.add(P, t, K, 1, 'calculate', 'Calculate 3.6 × 100.', answer=360,
      mistakes={3.600: 'Added zeros after the decimal point instead of moving digits', 36: 'Multiplied by 10 instead of 100'},
      hint='Multiplying by 100 moves every digit two places to the left.', explain='3.6 × 100 = 360. Each digit moves two places to the left.')
B.add(P, t, K, 1, 'calculate', 'Calculate 4520 ÷ 1000.', answer=4.52,
      mistakes={45.2: 'Divided by 100 instead of 1000', 452: 'Divided by 10'},
      hint='Dividing by 1000 moves every digit three places to the right.', explain='4520 ÷ 1000 = 4.52.')
B.add(P, t, A, 2, 'compare', 'Which of these decimals is the largest?', options=['0.7', '0.65', '0.609', '0.69'],
      mistakes={'0.609': 'Thought more digits means a bigger number', '0.69': 'Compared 69 with 7 instead of comparing tenths first'},
      hint='Compare the tenths digit first, then hundredths.', explain='0.7 has 7 tenths; the others have only 6 tenths, so 0.7 is largest.')
B.add(P, t, A, 2, 'calculate', 'The temperature at night was −6 °C. By midday it had risen by 11 degrees. What was the midday temperature?', answer=5, unit='°C',
      mistakes={-17: 'Moved the wrong way on the number line', 17: 'Added 6 and 11 ignoring the negative sign', -5: 'Got the right size but the wrong sign'},
      hint='Picture a thermometer: start at −6 and count up 11.', explain='From −6 up to 0 is 6 degrees. 11 − 6 = 5 more degrees above zero, so 5 °C.')
B.add(P, t, A, 2, 'round', 'Round 248 517 to the nearest thousand.', answer=249000,
      mistakes={248000: 'Rounded down — the hundreds digit 5 means round up', 250000: 'Rounded to the nearest ten thousand'},
      hint='Look at the hundreds digit.', explain='The hundreds digit is 5, so round the thousands up: 248 517 → 249 000.')
B.add(P, t, R, 3, 'explain', 'Ali says “3.45 is bigger than 3.5 because 45 is bigger than 5.” Which statement explains his mistake?',
      options=['He compared 45 hundredths with 5 tenths; 3.5 = 3.50, which is bigger than 3.45',
               'He is correct because 3.45 has more digits',
               '3.45 and 3.5 are equal because they both start with 3',
               'He should have rounded both numbers to the nearest whole number first'],
      hint='Write 3.5 with two decimal places.', explain='3.5 = 3.50. Comparing tenths: 5 tenths > 4 tenths, so 3.5 > 3.45.')
B.add(P, t, R, 3, 'write', 'A number rounded to the nearest 10 is 350. What is the smallest whole number it could be?', answer=345,
      mistakes={340: 'Forgot that 340 rounds to 340', 346: 'Did not realise 345 rounds up to 350', 355: 'Gave a number that rounds to 360'},
      hint='Which numbers round up to 350, and which round down to 350?', explain='Numbers from 345 to 354 round to 350. The smallest is 345.')
B.add(P, t, K, 2, 'write', 'Write these in order from smallest to largest: −3, 2, −8, 0. Type them separated by commas.',
      answer=['-8, -3, 0, 2', '−8, −3, 0, 2', '-8,-3,0,2', '−8,−3,0,2'],
      hint='On a number line, numbers further left are smaller.', explain='−8 is furthest left, then −3, then 0, then 2.')
B.add(X, t, K, 1, 'write', 'What is the value of the digit 4 in 18.743?', options=['4 hundredths', '4 tenths', '4 thousandths', '4 ones'],
      hint='After the decimal point: tenths, hundredths, thousandths.', explain='In 18.743 the digits after the point are 7 tenths, 4 hundredths, 3 thousandths.')
B.add(X, t, A, 2, 'calculate', 'A box holds 1000 paper clips. Each clip weighs 0.45 g. What is the total mass of the paper clips in grams?', answer=450, unit='g',
      hint='Multiply by 1000.', explain='0.45 × 1000 = 450 g.')
B.add(X, t, A, 2, 'calculate', 'The temperature in a freezer is −18 °C. The kitchen is 22 °C. What is the difference in temperature?', answer=40, unit='°C',
      mistakes={4: 'Subtracted 18 from 22 without considering the negative'}, hint='Count from −18 up to 0, then from 0 up to 22.', explain='18 + 22 = 40 degrees.')
B.add(X, t, R, 3, 'explain', 'Sara rounds 7.96 to one decimal place and writes 7.10. What should the answer be?', options=['8.0', '7.9', '7.10', '8.1'],
      mistakes={'7.9': 'Truncated instead of rounding', '7.10': 'Treated 9 + 1 as 10 tenths without regrouping'},
      hint='9 tenths + 1 tenth makes a whole one.', explain='The hundredths digit is 6, so round the tenths up: 9 tenths + 1 tenth = 10 tenths = 1 whole. 7.96 → 8.0.')

# ------------------------------------------------------------ calculation
t = 'm-calc'
B.add(D, t, K, 1, 'calculate', 'Calculate 6 + 4 × 5.', answer=26,
      mistakes={50: 'Worked left to right instead of multiplying first'},
      hint='Multiplication comes before addition.', explain='4 × 5 = 20 first, then 6 + 20 = 26.')
B.add(D, t, A, 2, 'calculate', 'Calculate 346 × 27.', answer=346*27,
      mistakes={346*20+7: 'Forgot to multiply 346 by 7', 3114: 'Only multiplied by 9 or misaligned columns'},
      hint='Split it: 346 × 20 and 346 × 7, then add.', steps=['346 × 20 = 6920', '346 × 7 = 2422', '6920 + 2422 = 9342'], explain='346 × 27 = 9342.')
B.add(P, t, K, 1, 'calculate', 'Calculate (15 − 3) × 4.', answer=48,
      mistakes={3: 'Ignored the brackets: 15 − 12'}, hint='Brackets first.', explain='15 − 3 = 12, then 12 × 4 = 48.')
B.add(P, t, K, 1, 'write', 'Which of these numbers is a prime number?', options=['29', '27', '21', '39'],
      mistakes={'27': '27 = 3 × 9', '21': '21 = 3 × 7', '39': '39 = 3 × 13'},
      hint='A prime has exactly two factors: 1 and itself.', explain='29 can only be divided by 1 and 29. The others are all multiples of 3.')
B.add(P, t, K, 1, 'calculate', 'What is 9 squared?', answer=81, mistakes={18: 'Multiplied by 2 instead of by itself'},
      hint='Squared means multiplied by itself.', explain='9² = 9 × 9 = 81.')
B.add(P, t, A, 2, 'calculate', 'Calculate 1458 ÷ 6.', answer=243, hint='Use short division: how many 6s in 14, then carry the remainder.',
      steps=['14 ÷ 6 = 2 remainder 2', '25 ÷ 6 = 4 remainder 1', '18 ÷ 6 = 3', 'Answer: 243'], explain='1458 ÷ 6 = 243.')
B.add(P, t, A, 2, 'write', 'List all the common factors of 18 and 24. Type them separated by commas, smallest first.',
      answer=['1, 2, 3, 6', '1,2,3,6'], hint='List the factors of each number, then find the ones in both lists.',
      explain='Factors of 18: 1, 2, 3, 6, 9, 18. Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Common: 1, 2, 3, 6.')
B.add(P, t, A, 2, 'estimate', 'Which is the best estimate for 49 × 61?', options=['3000', '2400', '3600', '300'],
      mistakes={'300': 'Lost a zero when estimating'}, hint='Round each number to the nearest 10.', explain='49 ≈ 50 and 61 ≈ 60. 50 × 60 = 3000.')
B.add(P, t, R, 3, 'explain', 'Without calculating exactly, how do you know that 298 × 4 cannot be 1292?',
      options=['300 × 4 = 1200, and 298 × 4 must be a little less than 1200', 'Because 1292 is an odd number', 'Because 298 is not a multiple of 4', 'Because you cannot multiply by 4 mentally'],
      hint='Round 298 to a friendly number.', explain='298 is less than 300, so 298 × 4 < 1200. The exact answer is 1192.')
B.add(P, t, R, 3, 'calculate', 'Find the smallest number that is a multiple of both 6 and 8.', answer=24,
      mistakes={48: 'Multiplied 6 × 8 — that is a common multiple but not the smallest', 2: 'Found a common factor instead of a multiple'},
      hint='List multiples of 8 and check which is also a multiple of 6.', explain='Multiples of 8: 8, 16, 24 … 24 is the first that is also a multiple of 6.')
B.add(P, t, K, 2, 'calculate', 'What is 4 cubed?', answer=64, mistakes={12: 'Multiplied by 3 instead of using 4 × 4 × 4', 16: 'Squared instead of cubed'},
      hint='Cubed means three lots multiplied: 4 × 4 × 4.', explain='4 × 4 = 16, 16 × 4 = 64.')
B.add(P, t, A, 3, 'calculate', 'Calculate 36 ÷ (2 + 4) × 3.', answer=18, mistakes={2: 'Multiplied before dividing; division and multiplication go left to right'},
      hint='Brackets first, then divide and multiply from left to right.', explain='2 + 4 = 6. 36 ÷ 6 = 6. 6 × 3 = 18.')
B.add(X, t, K, 1, 'calculate', 'Calculate 5004 − 1867.', answer=5004-1867,
      hint='Exchange across the zeros carefully.', explain='5004 − 1867 = 3137.')
B.add(X, t, A, 2, 'calculate', 'Calculate 23 × 148.', answer=23*148, hint='148 × 20 + 148 × 3.', explain='2960 + 444 = 3404.')
B.add(X, t, K, 2, 'write', 'Which number is both a square number and a cube number?', options=['64', '16', '27', '36'],
      hint='Check 8², 4³ …', explain='64 = 8 × 8 and 64 = 4 × 4 × 4.')
B.add(X, t, R, 3, 'write', 'Where should brackets go to make this true? 3 + 5 × 2 − 1 = 15',
      options=['(3 + 5) × 2 − 1', '3 + 5 × (2 − 1)', '3 + (5 × 2 − 1)', '(3 + 5 × 2) − 1'],
      hint='Try each one: work out the brackets first.', explain='(3 + 5) × 2 − 1 = 8 × 2 − 1 = 16 − 1 = 15.')
B.add(X, t, A, 2, 'calculate', 'Calculate 2184 ÷ 7.', answer=312, hint='Short division.', explain='21 ÷ 7 = 3, 8 ÷ 7 = 1 r1, 14 ÷ 7 = 2. Answer 312.')

# --------------------------------------------------------------- fractions
t = 'm-frac'
frac_bar = lambda parts, shaded: svg(
    '<svg viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg">' +
    ''.join(f'<rect x="{2+i*236/parts:.1f}" y="4" width="{236/parts:.1f}" height="32" fill="{"#9cc3f0" if i < shaded else "#fff"}" stroke="#1d2b44" stroke-width="1.5"/>' for i in range(parts)) +
    '</svg>')
B.add(D, t, K, 1, 'write', 'What fraction of this bar is shaded? Give your answer in its simplest form.', answer=['3/4'],
      stimulus=frac_bar(8, 6), mistakes={'6/8': 'Correct fraction but not simplified', '2/8': 'Counted the unshaded parts'},
      hint='Count shaded parts out of total parts, then simplify.', explain='6 out of 8 parts are shaded. 6/8 = 3/4 (divide top and bottom by 2).')
B.add(D, t, A, 2, 'calculate', 'Calculate 2/3 + 1/4. Give your answer as a fraction.', answer=['11/12'],
      mistakes={'3/7': 'Added numerators and denominators separately'},
      hint='Use a common denominator of 12.', steps=['2/3 = 8/12', '1/4 = 3/12', '8/12 + 3/12 = 11/12'], explain='2/3 + 1/4 = 11/12.')
B.add(P, t, K, 1, 'write', 'Simplify 12/18 fully.', answer=['2/3'], mistakes={'6/9': 'Simplified, but not fully', '4/6': 'Simplified, but not fully'},
      hint='Find the highest common factor of 12 and 18.', explain='HCF of 12 and 18 is 6. 12 ÷ 6 = 2, 18 ÷ 6 = 3 → 2/3.')
B.add(P, t, K, 1, 'calculate', 'Find 3/5 of 40.', answer=24, mistakes={8: 'Found 1/5 but did not multiply by 3', 120: 'Multiplied by 3 without dividing by 5'},
      hint='Find 1/5 first, then multiply by 3.', explain='40 ÷ 5 = 8. 8 × 3 = 24.')
B.add(P, t, A, 2, 'compare', 'Which fraction is greater than 1/2?', options=['5/8', '3/7', '4/9', '2/5'],
      hint='Compare each numerator with half of its denominator.', explain='Half of 8 is 4, and 5 > 4, so 5/8 > 1/2. The others are all less than half.')
B.add(P, t, A, 2, 'calculate', 'Calculate 5/6 − 1/3. Give your answer in its simplest form.', answer=['1/2'], mistakes={'4/3': 'Subtracted numerators and denominators separately', '3/6': 'Correct but not simplified'},
      hint='1/3 = 2/6.', explain='5/6 − 2/6 = 3/6 = 1/2.')
B.add(P, t, K, 2, 'write', 'Write 17/5 as a mixed number.', answer=['3 2/5'], mistakes={'3 1/5': 'Remainder wrong: 17 − 15 = 2'},
      hint='How many whole 5s go into 17?', explain='17 ÷ 5 = 3 remainder 2, so 17/5 = 3 2/5.')
B.add(P, t, A, 2, 'calculate', 'Calculate 3/8 × 4. Give your answer as a mixed number in simplest form.', answer=['1 1/2'], mistakes={'12/32': 'Multiplied the denominator as well', '12/8': 'Correct but not simplified'},
      hint='Multiply the numerator by 4.', explain='3/8 × 4 = 12/8 = 1 4/8 = 1 1/2.')
B.add(P, t, A, 3, 'calculate', 'Calculate 2/5 ÷ 2. Give your answer as a fraction.', answer=['1/5'], mistakes={'4/5': 'Multiplied instead of divided', '2/10': 'Correct but not simplified'},
      hint='Halving 2 fifths…', explain='Half of 2 fifths is 1 fifth: 2/5 ÷ 2 = 1/5.')
B.add(P, t, R, 3, 'explain', 'Maya ate 3/8 of a pizza and Leo ate 1/4 of the same pizza. Which statement is true?',
      options=['Together they ate 5/8, so 3/8 is left', 'Together they ate 4/12 of the pizza', 'Leo ate more because 4 is less than 8', 'Together they ate 4/8, so half is left'],
      mistakes={'Together they ate 4/12 of the pizza': 'Added numerators and denominators', 'Leo ate more because 4 is less than 8': 'Compared denominators only'},
      hint='Write 1/4 in eighths.', explain='1/4 = 2/8. 3/8 + 2/8 = 5/8 eaten; 8/8 − 5/8 = 3/8 left.')
B.add(P, t, R, 3, 'calculate', 'A ribbon is 2 1/2 m long. 3/4 m is cut off. How long is the remaining ribbon in metres? Give a mixed number.', answer=['1 3/4'],
      hint='Change to quarters: 2 1/2 = 10/4.', explain='10/4 − 3/4 = 7/4 = 1 3/4 m.')
B.add(X, t, K, 1, 'write', 'Which fraction is equivalent to 3/4?', options=['9/12', '6/9', '4/5', '3/8'],
      hint='Multiply top and bottom by the same number.', explain='3 × 3 = 9 and 4 × 3 = 12, so 3/4 = 9/12.')
B.add(X, t, A, 2, 'calculate', 'Calculate 1/2 + 2/5. Give your answer as a fraction.', answer=['9/10'], hint='Common denominator 10.', explain='5/10 + 4/10 = 9/10.')
B.add(X, t, A, 2, 'calculate', 'A class has 32 students. 5/8 of them walk to school. How many walk?', answer=20, hint='32 ÷ 8 × 5.', explain='32 ÷ 8 = 4, 4 × 5 = 20.')
B.add(X, t, R, 3, 'write', 'Order these from smallest to largest: 2/3, 3/5, 7/10. Type them separated by commas.', answer=['3/5, 2/3, 7/10', '3/5,2/3,7/10'],
      hint='Convert to thirtieths, or to decimals.', explain='3/5 = 0.6, 2/3 ≈ 0.67, 7/10 = 0.7.')

# ---------------------------------------------------- decimals & percentages
t = 'm-decpct'
B.add(D, t, K, 1, 'write', 'Write 0.35 as a percentage.', answer=35, unit='%', display='35%',
      mistakes={3.5: 'Moved the decimal point only one place', 0.35: 'Did not convert'},
      hint='Percent means “out of 100”.', explain='0.35 = 35/100 = 35%.')
B.add(D, t, A, 2, 'calculate', 'Find 15% of 80.', answer=12, mistakes={8: 'Found 10% only', 4: 'Found 5% only', 65: 'Subtracted 15 from 80'},
      hint='Find 10% and 5%, then add.', steps=['10% of 80 = 8', '5% of 80 = 4', '8 + 4 = 12'], explain='15% of 80 = 12.')
B.add(P, t, K, 1, 'write', 'Write 3/5 as a decimal.', answer=0.6, mistakes={3.5: 'Wrote the digits next to each other', 0.35: 'Wrote the digits next to each other'},
      hint='3/5 = 6/10.', explain='3/5 = 6/10 = 0.6.')
B.add(P, t, K, 1, 'write', 'Write 40% as a fraction in its simplest form.', answer=['2/5'], mistakes={'40/100': 'Correct but not simplified', '4/10': 'Simplified, but not fully'},
      hint='40% = 40/100. Then simplify.', explain='40/100 = 2/5.')
B.add(P, t, A, 2, 'calculate', 'Calculate 4.7 + 12.85.', answer=17.55, mistakes={13.32: 'Lined up the digits instead of the decimal points', 59.85: 'Misaligned place values'},
      hint='Line up the decimal points: 4.70 + 12.85.', explain='4.70 + 12.85 = 17.55.')
B.add(P, t, A, 2, 'calculate', 'Calculate 9 − 3.46.', answer=5.54, mistakes={6.46: 'Subtracted the smaller digit from the larger in each column'},
      hint='Write 9 as 9.00.', explain='9.00 − 3.46 = 5.54.')
B.add(P, t, A, 2, 'calculate', 'Calculate 2.4 × 3.', answer=7.2, mistakes={72: 'Lost the decimal point', 6.12: 'Multiplied the parts separately and joined them'},
      hint='24 × 3 = 72, then place the decimal point.', explain='2.4 × 3 = 7.2.')
B.add(P, t, A, 2, 'calculate', 'A jacket costs $60. It is reduced by 25% in a sale. What is the sale price?', answer=45, unit='$', display='$45',
      mistakes={15: 'Found the discount, not the new price', 35: 'Subtracted 25 instead of 25%'},
      hint='25% is a quarter.', explain='25% of 60 = 15. 60 − 15 = $45.')
B.add(P, t, R, 3, 'compare', 'Which is largest?', options=['0.7', '65%', '2/3', '0.67'],
      hint='Convert them all to decimals.', explain='65% = 0.65, 2/3 ≈ 0.667, 0.67, and 0.7. The largest is 0.7.')
B.add(P, t, R, 3, 'calculate', 'In a survey of 200 people, 36% said blue was their favourite colour. How many people is that?', answer=72,
      hint='1% of 200 is 2.', explain='36 × 2 = 72 people.')
B.add(P, t, A, 2, 'calculate', 'Calculate 7.2 ÷ 4.', answer=1.8, hint='72 ÷ 4 = 18.', explain='7.2 ÷ 4 = 1.8.')
B.add(X, t, K, 1, 'write', 'Write 7% as a decimal.', answer=0.07, mistakes={0.7: '7% is 7 hundredths, not 7 tenths'}, hint='7 out of 100.', explain='7% = 7/100 = 0.07.')
B.add(X, t, A, 2, 'calculate', 'Find 30% of 250.', answer=75, hint='10% of 250 = 25.', explain='25 × 3 = 75.')
B.add(X, t, A, 2, 'calculate', 'Three books cost $4.85, $7.50 and $3.25. What is the total cost in dollars?', answer=15.6, unit='$', display='$15.60', hint='Line up the decimal points.', explain='4.85 + 7.50 + 3.25 = 15.60.')
B.add(X, t, R, 3, 'explain', 'A shop says “50% off, then a further 50% off the new price.” Tom says that makes the item free. Which is correct?',
      options=['The final price is 25% of the original', 'Tom is right: 50% + 50% = 100%', 'The final price is 50% of the original', 'The final price is 0% of the original'],
      hint='Try it with a price of $100.', explain='$100 → $50 → $25. The item costs 25% of the original price.')

# ------------------------------------------------------------- ratio
t = 'm-ratio'
B.add(D, t, A, 2, 'calculate', 'Share 35 sweets between Ana and Ben in the ratio 3 : 4. How many sweets does Ben get?', answer=20,
      mistakes={15: 'Gave Ana’s share', 4: 'Gave one part only', 5: 'Found one part but did not multiply'},
      hint='How many parts altogether? 3 + 4.', steps=['3 + 4 = 7 parts', '35 ÷ 7 = 5 per part', 'Ben: 4 × 5 = 20'], explain='Ben gets 20 sweets.')
B.add(D, t, A, 2, 'calculate', '4 pens cost $6. How much do 10 pens cost?', answer=15, unit='$', display='$15',
      mistakes={12: 'Added 6 to 6 without using a unit price', 24: 'Multiplied 6 × 4'}, hint='Find the cost of 1 pen, or 2 pens.', explain='2 pens cost $3, so 10 pens cost 5 × $3 = $15.')
B.add(P, t, K, 1, 'write', 'In a bag there are 6 red and 9 blue beads. Write the ratio red : blue in its simplest form.', answer=['2:3', '2 : 3'],
      mistakes={'6:9': 'Correct but not simplified', '3:2': 'Ratio is the wrong way round'}, hint='Divide both numbers by their highest common factor.', explain='6 : 9 = 2 : 3 (divide both by 3).')
B.add(P, t, A, 2, 'calculate', 'A recipe uses 200 g of flour for 8 biscuits. How much flour is needed for 20 biscuits?', answer=500, unit='g',
      hint='Find the flour for 4 biscuits first.', explain='8 biscuits → 200 g, so 4 → 100 g, and 20 → 500 g.')
B.add(P, t, A, 2, 'calculate', 'For every 2 boys in a club there are 3 girls. There are 12 boys. How many girls are there?', answer=18,
      mistakes={13: 'Added 1 instead of scaling', 8: 'Scaled the wrong way'}, hint='12 boys is 6 lots of 2.', explain='12 ÷ 2 = 6, and 6 × 3 = 18 girls.')
B.add(P, t, A, 2, 'calculate', 'Paint is mixed using blue and yellow in the ratio 1 : 4. How many litres of yellow are in 15 litres of the mix?', answer=12, unit='litres',
      mistakes={3: 'Found one part only', 4: 'Used the ratio number, not the amount'}, hint='1 + 4 = 5 parts.', explain='15 ÷ 5 = 3 litres per part; yellow = 4 × 3 = 12 litres.')
B.add(P, t, R, 3, 'explain', 'In class A the ratio of boys to girls is 1 : 2. In class B it is 2 : 3. Which class has the greater fraction of girls?',
      options=['Class A, because 2/3 of the class are girls and 2/3 > 3/5', 'Class B, because 3 is bigger than 2', 'They are the same', 'Class B, because it has more parts'],
      hint='Turn each ratio into a fraction of the whole class.', explain='Class A: 2 out of 3 = 2/3 ≈ 0.67. Class B: 3 out of 5 = 0.6. Class A has a greater fraction of girls.')
B.add(P, t, R, 3, 'calculate', 'Sam and Priya share some money in the ratio 2 : 5. Priya gets $45. How much money was there in total?', answer=63, unit='$', display='$63',
      mistakes={18: 'Found Sam’s share only', 45: 'Gave Priya’s share'}, hint='5 parts = $45, so one part = ?', explain='One part = 45 ÷ 5 = $9. Total = 7 parts = $63.')
B.add(P, t, A, 2, 'calculate', 'A car travels 150 km in 3 hours at a steady speed. How far does it travel in 5 hours?', answer=250, unit='km',
      hint='Find the distance in 1 hour.', explain='150 ÷ 3 = 50 km per hour; 50 × 5 = 250 km.')
B.add(X, t, K, 1, 'write', 'Write the ratio 15 : 25 in its simplest form.', answer=['3:5', '3 : 5'], hint='Divide both by 5.', explain='15 : 25 = 3 : 5.')
B.add(X, t, A, 2, 'calculate', 'Share $56 in the ratio 3 : 5. What is the larger share in dollars?', answer=35, unit='$', display='$35', hint='8 parts altogether.', explain='56 ÷ 8 = 7; 5 × 7 = $35.')
B.add(X, t, A, 2, 'calculate', '6 identical bottles hold 4.5 litres altogether. How many litres do 10 bottles hold?', answer=7.5, unit='litres', hint='One bottle holds 4.5 ÷ 6.', explain='One bottle: 0.75 litres. 10 bottles: 7.5 litres.')
B.add(X, t, R, 3, 'calculate', 'Orange squash is made with 1 part squash to 6 parts water. Jo uses 420 ml of water. How much squash does she need in ml?', answer=70, unit='ml', hint='420 ÷ 6.', explain='420 ÷ 6 = 70 ml.')

# ------------------------------------------------------------ sequences
t = 'm-seq'
B.add(D, t, K, 1, 'write', 'What is the next number in the sequence 7, 11, 15, 19, …?', answer=23,
      mistakes={21: 'Added 2 instead of 4'}, hint='What is added each time?', explain='The sequence goes up by 4: 19 + 4 = 23.')
B.add(D, t, A, 2, 'calculate', 'The rule for a sequence is “multiply the position number by 3, then add 2.” What is the 10th term?', answer=32,
      mistakes={50: 'Added 2 before multiplying', 30: 'Forgot to add 2'}, hint='Position 10: 10 × 3 + 2.', explain='10 × 3 = 30, 30 + 2 = 32.')
B.add(P, t, K, 1, 'write', 'What is the next number: 50, 44, 38, 32, …?', answer=26, hint='How much is subtracted each time?', explain='Subtract 6 each time: 32 − 6 = 26.')
B.add(P, t, K, 1, 'write', 'Find the missing number: 3, 6, 12, __, 48', answer=24, mistakes={18: 'Assumed it adds 6 each time'}, hint='Is it adding or multiplying?', explain='Each term doubles: 12 × 2 = 24, and 24 × 2 = 48.')
B.add(P, t, A, 2, 'write', 'A sequence starts at −5 and goes up by 3 each time. What is the 4th term?', answer=4, mistakes={7: 'Counted one term too many', 1: 'Counted one term too few'},
      hint='Write the terms: −5, −2, …', explain='−5, −2, 1, 4. The 4th term is 4.')
B.add(P, t, A, 2, 'calculate', 'If n = 6, what is the value of 4n − 5?', answer=19, mistakes={41: 'Treated 4n as 46', 14: 'Subtracted before multiplying'},
      hint='4n means 4 × n.', explain='4 × 6 = 24, 24 − 5 = 19.')
B.add(P, t, A, 2, 'calculate', 'A taxi charges $3 plus $2 for every kilometre. Cost = 3 + 2k. How much is a 9 km journey?', answer=21, unit='$', display='$21',
      mistakes={45: 'Added 3 + 2 first, then multiplied'}, hint='Replace k with 9.', explain='3 + 2 × 9 = 3 + 18 = $21.')
B.add(P, t, R, 3, 'explain', 'Pattern: 1 square uses 4 matchsticks, 2 squares in a row use 7, 3 squares use 10. Which rule gives the number of matchsticks for n squares?',
      options=['3n + 1', '4n', 'n + 3', '3n + 4'], mistakes={'4n': 'Did not notice shared sides between squares'},
      hint='The number goes up by 3 each time, so start with 3n.', explain='Goes up by 3 → 3n. When n = 1, 3 × 1 = 3, so add 1: 3n + 1.')
B.add(P, t, R, 3, 'calculate', 'Using the rule 3n + 1, how many matchsticks are needed for 20 squares in a row?', answer=61, hint='Substitute n = 20.', explain='3 × 20 + 1 = 61.')
B.add(P, t, R, 3, 'explain', 'The sequence 5, 9, 13, 17 … continues. Will 100 be in the sequence?',
      options=['No — every term is 1 more than a multiple of 4, and 100 is a multiple of 4', 'Yes — the sequence goes on for ever, so it reaches every number', 'Yes — because 100 is even', 'No — because 100 is too big'],
      hint='Look at the terms when you divide by 4.', explain='Terms are 4n + 1: 5, 9, 13 … each leaves remainder 1 when divided by 4. 100 leaves remainder 0, so it is not in the sequence.')
B.add(X, t, K, 1, 'write', 'What is the next term: 2.5, 3.0, 3.5, 4.0, …?', answer=4.5, hint='Add 0.5 each time.', explain='4.0 + 0.5 = 4.5.')
B.add(X, t, A, 2, 'calculate', 'The nth term of a sequence is 5n − 2. What is the 8th term?', answer=38, hint='5 × 8 − 2.', explain='40 − 2 = 38.')
B.add(X, t, R, 3, 'write', 'The first term of a sequence is 4 and the term-to-term rule is “double then subtract 1”. What is the third term?', answer=13,
      hint='4 → ? → ?', explain='4 × 2 − 1 = 7; 7 × 2 − 1 = 13.')

# ------------------------------------------------------------ geometry
t = 'm-geom'
tri = svg('<svg viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg"><polygon points="20,120 200,120 70,20" fill="#eef4fb" stroke="#1d2b44" stroke-width="2"/><text x="40" y="112" font-size="14">58°</text><text x="160" y="112" font-size="14">47°</text><text x="66" y="48" font-size="16" font-weight="bold">x</text></svg>', 'Not drawn to scale')
B.add(D, t, A, 2, 'calculate', 'Find the size of angle x in the triangle.', answer=75, unit='°', stimulus=tri,
      mistakes={105: 'Added the two angles but did not subtract from 180', 255: 'Used 360° instead of 180°'},
      hint='Angles in a triangle add up to 180°.', explain='180 − 58 − 47 = 75°.')
B.add(D, t, K, 1, 'write', 'How many lines of symmetry does a regular hexagon have?', answer=6,
      mistakes={3: 'Counted only lines through opposite corners', 2: 'Counted only vertical and horizontal lines'},
      hint='A regular polygon has as many lines of symmetry as sides.', explain='A regular hexagon has 6 lines of symmetry: 3 through opposite corners and 3 through midpoints of opposite sides.')
B.add(P, t, K, 1, 'write', 'Which 3D shape has 6 faces, 12 edges and 8 vertices?', options=['Cuboid', 'Triangular prism', 'Square-based pyramid', 'Cylinder'],
      hint='Think of a box.', explain='A cuboid (like a box) has 6 rectangular faces, 12 edges and 8 vertices.')
B.add(P, t, K, 1, 'write', 'An angle measures 125°. What type of angle is it?', options=['Obtuse', 'Acute', 'Reflex', 'Right angle'],
      hint='Acute < 90°, obtuse between 90° and 180°.', explain='125° is between 90° and 180°, so it is obtuse.')
B.add(P, t, A, 2, 'calculate', 'Angles on a straight line: one angle is 68°. What is the other angle?', answer=112, unit='°',
      mistakes={292: 'Used 360° instead of 180°', 22: 'Used 90° instead of 180°'}, hint='Angles on a straight line add to 180°.', explain='180 − 68 = 112°.')
B.add(P, t, A, 2, 'calculate', 'Three angles meet at a point. Two of them are 140° and 95°. What is the third angle?', answer=125, unit='°',
      hint='Angles around a point add to 360°.', explain='360 − 140 − 95 = 125°.')
B.add(P, t, A, 2, 'write', 'The point (3, −2) is translated 4 squares left and 5 squares up. What are the new coordinates? Write as (x, y).',
      answer=['(-1, 3)', '(-1,3)', '(−1, 3)', '(−1,3)', '-1, 3', '-1,3'], mistakes={'(7, 3)': 'Moved right instead of left', '(-1, -7)': 'Moved down instead of up'},
      hint='Left changes x; up changes y.', explain='x: 3 − 4 = −1. y: −2 + 5 = 3. New point (−1, 3).')
B.add(P, t, A, 2, 'write', 'The point (2, 5) is reflected in the x-axis. What are the new coordinates?', answer=['(2, -5)', '(2,-5)', '(2, −5)', '(2,−5)', '2, -5'],
      mistakes={'(-2, 5)': 'Reflected in the y-axis instead'}, hint='Reflecting in the x-axis keeps x the same and changes the sign of y.', explain='(2, 5) → (2, −5).')
B.add(P, t, R, 3, 'explain', 'Lin says “All squares are rectangles, but not all rectangles are squares.” Is she right?',
      options=['Yes — a square has four right angles, so it is a special rectangle with equal sides', 'No — squares and rectangles are completely different shapes', 'No — all rectangles are squares', 'Yes — because squares are smaller'],
      hint='What properties make a shape a rectangle?', explain='A rectangle has four right angles and opposite sides equal. A square has these properties and all sides equal, so it is a special rectangle.')
B.add(P, t, R, 3, 'calculate', 'An isosceles triangle has one angle of 40°. The other two angles are equal. What size is each of them?', answer=70, unit='°',
      mistakes={100: 'Subtracted 40 from 180 but did not halve', 40: 'Assumed all angles equal 40°'}, hint='180 − 40, then share between two equal angles.', explain='180 − 40 = 140; 140 ÷ 2 = 70°.')
B.add(P, t, K, 2, 'write', 'Which quadrilateral has exactly one pair of parallel sides?', options=['Trapezium', 'Parallelogram', 'Rhombus', 'Rectangle'],
      hint='Parallelograms have two pairs.', explain='A trapezium has exactly one pair of parallel sides.')
B.add(P, t, A, 3, 'calculate', 'What is the size of each interior angle of a regular pentagon? (The interior angles of a pentagon add up to 540°.)', answer=108, unit='°',
      hint='Share 540° between 5 equal angles.', explain='540 ÷ 5 = 108°.')
B.add(X, t, K, 1, 'write', 'How many faces does a triangular prism have?', answer=5, mistakes={6: 'Confused with a cuboid'}, hint='2 triangles and some rectangles.', explain='2 triangular faces + 3 rectangular faces = 5.')
B.add(X, t, A, 2, 'calculate', 'Two angles in a triangle are 90° and 34°. Find the third angle.', answer=56, unit='°', hint='180 − 90 − 34.', explain='56°.')
B.add(X, t, A, 2, 'write', 'A, B and C are three corners of a square: A(1, 1), B(1, 4), C(4, 4). What are the coordinates of the fourth corner? Write as (x, y).',
      answer=['(4, 1)', '(4,1)', '4, 1', '4,1'], hint='Sketch it.', explain='The square has sides of length 3; the missing corner is (4, 1).')
B.add(X, t, R, 3, 'calculate', 'A shape is rotated 90° clockwise, then another 180° clockwise. What single rotation, in degrees clockwise, has the same effect?', answer=270, unit='°',
      hint='Add the turns.', explain='90 + 180 = 270° clockwise (the same as 90° anticlockwise).')

# ----------------------------------------------------------- measurement
t = 'm-meas'
B.add(D, t, K, 1, 'calculate', 'Convert 2.5 kilograms to grams.', answer=2500, unit='g', mistakes={250: 'Multiplied by 100 instead of 1000', 25: 'Multiplied by 10'},
      hint='1 kg = 1000 g.', explain='2.5 × 1000 = 2500 g.')
B.add(D, t, A, 2, 'calculate', 'A rectangle is 8 cm long and 5 cm wide. What is its area?', answer=40, unit='cm²',
      mistakes={26: 'Calculated the perimeter instead', 13: 'Added length and width'}, hint='Area of a rectangle = length × width.', explain='8 × 5 = 40 cm².')
B.add(P, t, K, 1, 'calculate', 'How many millilitres are in 3.2 litres?', answer=3200, unit='ml', mistakes={320: 'Multiplied by 100'}, hint='1 litre = 1000 ml.', explain='3.2 × 1000 = 3200 ml.')
B.add(P, t, K, 1, 'calculate', 'Convert 450 cm to metres.', answer=4.5, unit='m', mistakes={45: 'Divided by 10 instead of 100', 45000: 'Multiplied instead of divided'}, hint='100 cm = 1 m.', explain='450 ÷ 100 = 4.5 m.')
B.add(P, t, A, 2, 'calculate', 'A square has a perimeter of 36 cm. What is its area?', answer=81, unit='cm²',
      mistakes={36: 'Gave the perimeter', 9: 'Gave the side length'}, hint='Find the side length first.', explain='36 ÷ 4 = 9 cm per side; area 9 × 9 = 81 cm².')
B.add(P, t, A, 2, 'calculate', 'Find the area of a triangle with base 10 cm and perpendicular height 6 cm.', answer=30, unit='cm²',
      mistakes={60: 'Forgot to halve'}, hint='Area of a triangle = ½ × base × height.', explain='½ × 10 × 6 = 30 cm².')
B.add(P, t, A, 2, 'calculate', 'Find the volume of a cuboid 5 cm by 4 cm by 3 cm.', answer=60, unit='cm³',
      mistakes={12: 'Added the dimensions', 47: 'Calculated surface area incorrectly'}, hint='Volume = length × width × height.', explain='5 × 4 × 3 = 60 cm³.')
B.add(P, t, A, 2, 'calculate', 'A film starts at 18:45 and lasts 1 hour 50 minutes. At what time does it end? Write in 24-hour time, e.g. 20:35.', answer=['20:35'],
      mistakes={'19:95': 'Treated time as a decimal number', '20:95': 'Did not convert 60 minutes into an hour'},
      hint='Add 1 hour, then 50 minutes, crossing the hour carefully.', explain='18:45 + 1 h = 19:45. 19:45 + 15 min = 20:00, + 35 min = 20:35.')
B.add(P, t, R, 3, 'calculate', 'A garden is shaped like an L. It is made of a 10 m × 4 m rectangle and a 3 m × 3 m square joined together. What is the total area?', answer=49, unit='m²',
      hint='Find each area, then add.', explain='10 × 4 = 40 m², 3 × 3 = 9 m². Total 49 m².')
B.add(P, t, R, 3, 'explain', 'Two rectangles both have a perimeter of 20 cm. Which statement is true?',
      options=['They can have different areas, e.g. 5 × 5 = 25 cm² and 8 × 2 = 16 cm²', 'They must have the same area', 'Their areas must both be 20 cm²', 'The longer one always has the bigger area'],
      hint='Try different lengths and widths that add to 10.', explain='Many rectangles have a perimeter of 20 cm (length + width = 10), and their areas differ.')
B.add(P, t, A, 2, 'calculate', 'A parcel weighs 1.35 kg. Another weighs 870 g. What is their total mass in grams?', answer=2220, unit='g',
      mistakes={871.35: 'Added without converting units'}, hint='Convert 1.35 kg to grams first.', explain='1350 g + 870 g = 2220 g.')
B.add(X, t, K, 1, 'calculate', 'Convert 7.5 km to metres.', answer=7500, unit='m', hint='1 km = 1000 m.', explain='7.5 × 1000 = 7500 m.')
B.add(X, t, A, 2, 'calculate', 'A rectangular field is 45 m long and 20 m wide. What is its perimeter?', answer=130, unit='m', mistakes={900: 'Calculated area instead', 65: 'Added only one length and one width'}, hint='Add all four sides.', explain='45 + 20 + 45 + 20 = 130 m.')
B.add(X, t, A, 2, 'calculate', 'A bus leaves at 09:38 and arrives at 11:15. How many minutes is the journey?', answer=97, unit='minutes', hint='Count on to 10:00, then to 11:15.', explain='09:38 → 10:00 is 22 min; 10:00 → 11:15 is 75 min. Total 97 minutes.')
B.add(X, t, R, 3, 'calculate', 'A cube has a volume of 64 cm³. What is the length of one edge?', answer=4, unit='cm', hint='Which number cubed is 64?', explain='4 × 4 × 4 = 64, so each edge is 4 cm.')
B.add(X, t, A, 3, 'calculate', 'Find the area of a triangle with base 7 cm and height 9 cm.', answer=31.5, unit='cm²', hint='½ × base × height.', explain='½ × 7 × 9 = 31.5 cm².')

# ------------------------------------------------------- statistics
t = 'm-stats'
B.add(D, t, K, 1, 'calculate', 'Find the mean of 4, 7, 9, 10 and 5.', answer=7, mistakes={35: 'Found the total but did not divide', 9: 'Gave the median of the unordered list'},
      hint='Add them up and divide by how many there are.', explain='4 + 7 + 9 + 10 + 5 = 35; 35 ÷ 5 = 7.')
B.add(D, t, A, 2, 'calculate', 'The bar chart shows books read by a class. How many more books were read in March than in January?',
      answer=14, stimulus=bar(['Jan', 'Feb', 'Mar', 'Apr'], [18, 25, 32, 21], 'Books read each month', 'Books'),
      mistakes={50: 'Added instead of subtracted'}, hint='Read both bars carefully, then subtract.', explain='March: 32, January: 18. 32 − 18 = 14.')
B.add(P, t, K, 1, 'calculate', 'Find the median of 3, 8, 6, 1, 9.', answer=6, mistakes={5.4: 'Found the mean instead'},
      hint='Put them in order first.', explain='In order: 1, 3, 6, 8, 9. The middle value is 6.')
B.add(P, t, K, 1, 'calculate', 'Find the range of 12, 5, 19, 8, 15.', answer=14, mistakes={7: 'Subtracted two neighbouring values'}, hint='Largest minus smallest.', explain='19 − 5 = 14.')
B.add(P, t, K, 1, 'write', 'What is the mode of 4, 6, 6, 2, 7, 6, 4?', answer=6, hint='The value that appears most often.', explain='6 appears three times — more than any other number.')
B.add(P, t, A, 2, 'calculate', 'Find the median of 2, 9, 4, 7, 5, 10.', answer=6, mistakes={37: 'Added the values', 7: 'Took one middle value instead of halfway between the two'},
      hint='With an even number of values, find the halfway point between the two middle values.', explain='Ordered: 2, 4, 5, 7, 9, 10. Middle values 5 and 7 → median 6.')
B.add(P, t, K, 1, 'write', 'A fair six-sided dice is rolled. What is the probability of rolling a 4? Give a fraction.', answer=['1/6'], hint='How many outcomes? How many are 4?', explain='1 favourable outcome out of 6 equally likely outcomes: 1/6.')
B.add(P, t, A, 2, 'write', 'A bag has 3 red, 5 blue and 2 green counters. One is taken without looking. What is the probability it is blue? Give a fraction in simplest form.',
      answer=['1/2'], mistakes={'5/10': 'Correct but not simplified', '5/5': 'Used the wrong total'}, hint='Total counters = 10.', explain='5 blue out of 10 counters = 5/10 = 1/2.')
B.add(P, t, A, 2, 'calculate', 'The line graph shows the temperature during a day. By how many degrees did the temperature rise between 08:00 and 14:00?', answer=9, unit='°C',
      stimulus=line(['08:00', '10:00', '12:00', '14:00', '16:00'], [12, 15, 19, 21, 17], 'Temperature during the day', '°C'),
      hint='Read the values at 08:00 and 14:00.', explain='21 − 12 = 9 °C.')
B.add(P, t, R, 3, 'calculate', 'The mean of four numbers is 8. Three of the numbers are 5, 9 and 10. What is the fourth number?', answer=8,
      mistakes={24: 'Gave the sum of the three known numbers'}, hint='If the mean is 8, the total of four numbers must be 4 × 8.', explain='Total = 32. 5 + 9 + 10 = 24. 32 − 24 = 8.')
B.add(P, t, R, 3, 'explain', 'A pie chart shows 60 children’s favourite fruit. The apple sector is a quarter of the circle. Which statement is correct?',
      options=['15 children chose apple', '25 children chose apple', '4 children chose apple', 'You cannot tell without the angle'],
      hint='A quarter of 60.', explain='¼ of 60 = 15 children.')
B.add(X, t, K, 1, 'calculate', 'Find the range of 34, 27, 41, 30.', answer=14, hint='Largest − smallest.', explain='41 − 27 = 14.')
B.add(X, t, A, 2, 'calculate', 'Five children scored 6, 8, 8, 9 and 4 in a quiz. Find the mean score.', answer=7, hint='Total ÷ 5.', explain='35 ÷ 5 = 7.')
B.add(X, t, A, 2, 'calculate', 'The table shows the number of pets owned by children in a class. How many children were asked?', answer=25,
      stimulus=table(['Number of pets', '0', '1', '2', '3'], [['Children', '6', '10', '7', '2']], 'Pets owned'),
      mistakes={6: 'Counted the categories', 26: 'Added the pet numbers too'}, hint='Add the frequencies.', explain='6 + 10 + 7 + 2 = 25 children.')
B.add(X, t, R, 3, 'explain', 'A spinner has 8 equal sections: 3 red, 4 blue, 1 yellow. Which word best describes the chance of landing on yellow?',
      options=['Unlikely', 'Certain', 'Even chance', 'Impossible'], hint='1 out of 8.', explain='1/8 is less than an even chance but not zero, so unlikely.')

# --------------------------------------------- reasoning & problem solving
t = 'm-reason'
B.add(D, t, R, 3, 'calculate', 'A cinema ticket costs $8 for adults and $5 for children. A family buys 2 adult and 3 child tickets and pays with a $50 note. How much change do they get?',
      answer=19, unit='$', display='$19', mistakes={31: 'Gave the total cost, not the change', 24: 'Mixed up adult and child prices'},
      hint='Work out the total cost first.', steps=['2 × $8 = $16', '3 × $5 = $15', 'Total = $31', '$50 − $31 = $19'], explain='The change is $19.')
B.add(D, t, R, 3, 'explain', 'Kai says the answer to 1.2 × 4 is 4.8, because 12 × 4 = 48 and 1.2 is ten times smaller than 12. Is his reasoning correct?',
      options=['Yes — dividing 48 by 10 gives 4.8', 'No — the answer is 48', 'No — the answer is 0.48', 'No — you cannot use 12 × 4 to help'],
      hint='Check the size of the answer: 1.2 is just over 1.', explain='His reasoning is correct. 1.2 × 4 is roughly 1 × 4 = 4, so 4.8 is sensible.')
B.add(P, t, A, 2, 'calculate', 'Eggs are packed in boxes of 6. How many boxes are needed for 75 eggs?', answer=13, mistakes={12: 'Rounded down — the 3 extra eggs still need a box', 12.5: 'Gave a decimal answer for a number of boxes'},
      hint='75 ÷ 6, then think about any remainder.', explain='75 ÷ 6 = 12 remainder 3. The 3 extra eggs need another box, so 13 boxes.')
B.add(P, t, A, 2, 'calculate', 'A school orders 18 packs of pencils. Each pack has 24 pencils. They give out 350 pencils. How many are left?', answer=82,
      hint='Find the total number of pencils first.', explain='18 × 24 = 432. 432 − 350 = 82.')
B.add(P, t, R, 3, 'calculate', 'I think of a number, multiply it by 4, then subtract 7. The answer is 29. What was my number?', answer=9,
      mistakes={5.5: 'Undid the operations in the wrong order'}, hint='Work backwards: add 7, then divide by 4.', explain='29 + 7 = 36; 36 ÷ 4 = 9.')
B.add(P, t, R, 3, 'calculate', 'Two numbers add up to 50. One number is 12 more than the other. What is the larger number?', answer=31,
      mistakes={38: 'Added 12 to 50 ÷ 2 twice', 25: 'Split 50 equally'}, hint='Take away the 12 first, then share equally.', explain='50 − 12 = 38; 38 ÷ 2 = 19. Larger = 19 + 12 = 31.')
B.add(P, t, R, 3, 'explain', 'Nina calculated 503 − 198 = 395. Which check shows she has made a mistake?',
      options=['395 + 198 = 593, not 503', '503 + 198 = 701', '395 − 198 = 197', '503 is odd, so the answer must be even'],
      hint='Use the inverse operation.', explain='Addition undoes subtraction: 395 + 198 = 593 ≠ 503. The correct answer is 305.')
B.add(P, t, A, 2, 'calculate', 'Juice costs $1.25 per bottle. How many bottles can you buy with $10?', answer=8, hint='How many $1.25s make $10?', explain='$1.25 × 8 = $10.')
B.add(P, t, R, 3, 'calculate', 'A rectangle has a length that is 3 times its width. Its perimeter is 48 cm. What is its length in cm?', answer=18, unit='cm',
      mistakes={6: 'Gave the width', 12: 'Divided the perimeter by 4'}, hint='Perimeter = width + 3 widths + width + 3 widths = 8 widths.', explain='48 ÷ 8 = 6 cm width; length = 18 cm.')
B.add(P, t, R, 3, 'calculate', 'Apples cost 35c each or 6 for $1.80. How much do you save by buying 6 at the special price instead of individually? Give your answer in cents.', answer=30, unit='c',
      hint='Find the cost of 6 apples at 35c each.', explain='6 × 35c = $2.10. $2.10 − $1.80 = 30c.')
B.add(P, t, R, 3, 'explain', 'Which is the most efficient way to calculate 25 × 36 mentally?',
      options=['25 × 4 = 100, so 25 × 36 = 100 × 9 = 900', 'Count up in 25s thirty-six times', 'Use long multiplication on paper', 'Add 25 and 36'],
      hint='36 = 4 × 9.', explain='25 × 4 = 100 is easy, and 36 = 4 × 9, so the answer is 900.')
B.add(X, t, A, 2, 'calculate', 'A minibus holds 14 passengers. How many minibuses are needed to take 100 students on a trip?', answer=8, mistakes={7: 'Rounded down; 2 students would be left behind'},
      hint='100 ÷ 14, then think about the remainder.', explain='100 ÷ 14 = 7 remainder 2, so 8 minibuses.')
B.add(X, t, R, 3, 'calculate', 'Tickets for a show cost $12 each. The school has $500. What is the greatest number of tickets the school can buy?', answer=41,
      hint='500 ÷ 12.', explain='12 × 41 = 492, and 12 × 42 = 504, which is too much. 41 tickets.')
B.add(X, t, R, 3, 'calculate', 'The total mass of 3 identical boxes and a 2 kg bag is 14 kg. What is the mass of one box in kg?', answer=4, unit='kg', hint='Remove the bag first.', explain='14 − 2 = 12 kg; 12 ÷ 3 = 4 kg.')
B.add(X, t, R, 3, 'explain', 'Ravi says “When you multiply two numbers, the answer is always bigger than both numbers.” Which example shows he is wrong?',
      options=['0.5 × 8 = 4', '3 × 7 = 21', '10 × 10 = 100', '2 × 9 = 18'], hint='Try multiplying by a number less than 1.', explain='0.5 × 8 = 4, which is smaller than 8.')
B.add(X, t, A, 2, 'calculate', 'A shop sells pencils at 3 for $1.20. How much do 12 pencils cost in dollars?', answer=4.8, unit='$', display='$4.80', hint='12 pencils = 4 lots of 3.', explain='4 × $1.20 = $4.80.')

n = B.dump(sys.argv[1])
print('maths', n)
