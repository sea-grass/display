# Display

## An Abstract Pixel Art Generator

I guess it's not technically abstract in the sense that the images are
randomly created, as it is not stochastic.

The images are created using a size and variance parameter (`n` and `v`,
respectively). It determines each pixel's colour value based upon the
previous pixel's colour value, the difference being the variance. The first
pixel is in the top-left and they are traversed horizontally then vertically.
