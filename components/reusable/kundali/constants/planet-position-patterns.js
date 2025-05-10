// Single planet positioning patterns for each house in React Native
export const PLANET_PATTERNS = {
  P1: {
    1: {
      positions: [
        { 
          position: {
            left: '50%',
            top: '65%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
          }
        },
      ],
      containerStyle: { 
        alignItems: 'center', 
        justifyContent: 'center'
      },
    },
    2: {
      positions: [
        { 
          position: {
            left: '42%',
            top: '65%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
          }
        },
        { 
          position: {
            left: '58%',
            top: '65%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
          }
        },
      ],
      containerStyle: { 
        alignItems: 'center', 
        justifyContent: 'center'
      },
    },
    3: {
      positions: [
        { 
          position: {
            left: '35%',
            top: '65%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
          }
        },
        { 
          position: {
            left: '50%',
            top: '65%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
          }
        },
        { 
          position: {
            left: '65%',
            top: '65%',
            transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
          }
        },
      ],
      containerStyle: { 
        alignItems: 'center', 
        justifyContent: 'center'
      },
    },
    4: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    5: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[42%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[58%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    6: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    7: {
      positions: [
        { x: "left-[30%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[43%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[57%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[70%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    8: {
      positions: [
        { x: "left-[25%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[37.5%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[62.5%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[75%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    9: {
      positions: [
        { x: "left-[20%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[32%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[44%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[56%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[68%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[80%] -translate-x-1/2", y: "top-[55%] -translate-y-1/2" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
  },
  P2: {
    1: {
      positions: [
        { 
          position: {
            left: '50%',
            bottom: '50%',
            transform: [{ translateX: '-50%' }]
          }
        },
      ],
      containerStyle: { 
        alignItems: 'flex-end', 
        justifyContent: 'center'
      },
    },
    2: {
      positions: [
        { x: "left-[42%] -translate-x-1/2", y: "bottom-[50%]" },
        { x: "left-[58%] -translate-x-1/2", y: "bottom-[50%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    3: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[50%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[50%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[50%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    4: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    5: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[42%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[58%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    6: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    7: {
      positions: [
        { x: "left-[30%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[43%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[57%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[70%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    8: {
      positions: [
        { x: "left-[25%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[37.5%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[62.5%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[75%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    9: {
      positions: [
        { x: "left-[20%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[32%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[44%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[56%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[68%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[80%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
  },
  P3: {
    1: {
      positions: [
        { 
          position: {
            right: '50%',
            top: '50%',
            transform: [{ translateY: '-50%' }]
          }
        },
      ],
      containerStyle: { 
        alignItems: 'center', 
        justifyContent: 'flex-end'
      },
    },
    2: {
      positions: [
        { x: "right-[50%]", y: "top-[42%] -translate-y-1/2" },
        { x: "right-[50%]", y: "top-[58%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    3: {
      positions: [
        { x: "right-[50%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[50%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[50%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    4: {
      positions: [
        { x: "right-[70%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[65%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    5: {
      positions: [
        { x: "right-[70%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[65%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[42%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[58%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    6: {
      positions: [
        { x: "right-[70%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[65%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    7: {
      positions: [
        { x: "right-[70%]", y: "top-[30%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[43%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[57%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[70%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    8: {
      positions: [
        { x: "right-[70%]", y: "top-[25%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[37.5%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[62.5%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[75%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    9: {
      positions: [
        { x: "right-[70%]", y: "top-[20%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[32%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[44%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[56%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[68%] -translate-y-1/2" },
        { x: "right-[70%]", y: "top-[80%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
  },
  P4: {
    1: {
      positions: [{ x: "right-[35%]", y: "top-1/2 -translate-y-1/2" }],
      containerClass: "flex items-center",
    },
    2: {
      positions: [
        { x: "right-[35%]", y: "top-[42%] -translate-y-1/2" },
        { x: "right-[35%]", y: "top-[58%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    3: {
      positions: [
        { x: "right-[35%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[35%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[35%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    4: {
      positions: [
        { x: "right-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[65%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[50%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    5: {
      positions: [
        { x: "right-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[65%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[42%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[58%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    6: {
      positions: [
        { x: "right-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[65%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    7: {
      positions: [
        { x: "right-[40%]", y: "top-[30%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[43%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[57%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[70%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    8: {
      positions: [
        { x: "right-[40%]", y: "top-[25%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[37.5%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[62.5%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[75%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    9: {
      positions: [
        { x: "right-[40%]", y: "top-[20%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[32%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[44%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[56%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[68%] -translate-y-1/2" },
        { x: "right-[40%]", y: "top-[80%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[35%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[50%] -translate-y-1/2" },
        { x: "right-[25%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
  },
  P5: {
    1: {
      positions: [{ x: "right-[50%]", y: "bottom-1/2 translate-y-1/2" }],
      containerClass: "flex items-center justify-end",
    },
    2: {
      positions: [
        { x: "right-[50%]", y: "bottom-[58%] translate-y-1/2" },
        { x: "right-[50%]", y: "bottom-[42%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    3: {
      positions: [
        { x: "right-[50%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "right-[50%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[50%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    4: {
      positions: [
        { x: "right-[70%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[35%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[50%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    5: {
      positions: [
        { x: "right-[70%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[35%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[42%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[58%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    6: {
      positions: [
        { x: "right-[70%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[35%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    7: {
      positions: [
        { x: "right-[70%]", y: "bottom-[70%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[57%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[43%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[30%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    8: {
      positions: [
        { x: "right-[70%]", y: "bottom-[75%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[62.5%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[37.5%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[25%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    9: {
      positions: [
        { x: "right-[70%]", y: "bottom-[80%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[68%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[56%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[44%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[32%] translate-y-1/2" },
        { x: "right-[70%]", y: "bottom-[20%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "right-[40%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
  },
  P6: {
    1: {
      positions: [{ x: "left-1/2 -translate-x-1/2", y: "top-[50%]" }],
      containerClass: "flex items-start justify-center",
    },
    2: {
      positions: [
        { x: "left-[42%] -translate-x-1/2", y: "top-[50%]" },
        { x: "left-[58%] -translate-x-1/2", y: "top-[50%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    3: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[50%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[50%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[50%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    4: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    5: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[42%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[58%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    6: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    7: {
      positions: [
        { x: "left-[30%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[43%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[57%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[70%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    8: {
      positions: [
        { x: "left-[25%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[37.5%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[62.5%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[75%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    9: {
      positions: [
        { x: "left-[20%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[32%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[44%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[56%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[68%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[80%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
  },
  P7: {
    1: {
      positions: [
        { x: "left-1/2 -translate-x-1/2", y: "bottom-[65%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    2: {
      positions: [
        { x: "left-[42%] -translate-x-1/2", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[58%] -translate-x-1/2", y: "bottom-[65%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    3: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[65%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    4: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    5: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[42%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[58%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    6: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    7: {
      positions: [
        { x: "left-[30%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[43%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[57%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[70%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    8: {
      positions: [
        { x: "left-[25%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        {
          x: "left-[37.5%] -translate-x-1/2",
          y: "bottom-[55%] translate-y-1/2",
        },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        {
          x: "left-[62.5%] -translate-x-1/2",
          y: "bottom-[55%] translate-y-1/2",
        },
        { x: "left-[75%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
    9: {
      positions: [
        { x: "left-[20%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[32%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[44%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[56%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[68%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[80%] -translate-x-1/2", y: "bottom-[55%] translate-y-1/2" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%] translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-center",
    },
  },
  P8: {
    1: {
      positions: [{ x: "left-1/2 -translate-x-1/2", y: "top-[50%]" }],
      containerClass: "flex items-start justify-center",
    },
    2: {
      positions: [
        { x: "left-[42%] -translate-x-1/2", y: "top-[50%]" },
        { x: "left-[58%] -translate-x-1/2", y: "top-[50%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    3: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[50%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[50%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[50%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    4: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    5: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[42%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[58%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    6: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    7: {
      positions: [
        { x: "left-[30%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[43%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[57%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[70%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    8: {
      positions: [
        { x: "left-[25%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[37.5%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[62.5%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[75%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
    9: {
      positions: [
        { x: "left-[20%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[32%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[44%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[56%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[68%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[80%] -translate-x-1/2", y: "top-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "top-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "top-[40%]" },
      ],
      containerClass: "flex items-start justify-center",
    },
  },
  P9: {
    1: {
      positions: [{ x: "left-[50%]", y: "bottom-1/2 translate-y-1/2" }],
      containerClass: "flex items-center",
    },
    2: {
      positions: [
        { x: "left-[50%]", y: "bottom-[58%] translate-y-1/2" },
        { x: "left-[50%]", y: "bottom-[42%] translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    3: {
      positions: [
        { x: "left-[50%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[50%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[50%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    4: {
      positions: [
        { x: "left-[70%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[35%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[50%] translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    5: {
      positions: [
        { x: "left-[70%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[35%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[42%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[58%] translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    6: {
      positions: [
        { x: "left-[70%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[35%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    7: {
      positions: [
        { x: "left-[70%]", y: "bottom-[70%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[57%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[43%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[30%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    8: {
      positions: [
        { x: "left-[70%]", y: "bottom-[75%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[62.5%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[37.5%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[25%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    9: {
      positions: [
        { x: "left-[70%]", y: "bottom-[80%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[68%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[56%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[44%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[32%] translate-y-1/2" },
        { x: "left-[70%]", y: "bottom-[20%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[65%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[50%] translate-y-1/2" },
        { x: "left-[40%]", y: "bottom-[35%] translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
  },
  P10: {
    1: {
      positions: [{ x: "left-[35%]", y: "top-1/2 -translate-y-1/2" }],
      containerClass: "flex items-center justify-end",
    },
    2: {
      positions: [
        { x: "left-[35%]", y: "top-[42%] -translate-y-1/2" },
        { x: "left-[35%]", y: "top-[58%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    3: {
      positions: [
        { x: "left-[35%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[35%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[35%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    4: {
      positions: [
        { x: "left-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[65%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[50%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    5: {
      positions: [
        { x: "left-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[65%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[42%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[58%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    6: {
      positions: [
        { x: "left-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[65%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    7: {
      positions: [
        { x: "left-[40%]", y: "top-[30%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[43%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[57%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    8: {
      positions: [
        { x: "left-[40%]", y: "top-[25%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[37.5%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[62.5%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[75%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
    9: {
      positions: [
        { x: "left-[40%]", y: "top-[20%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[32%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[44%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[56%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[68%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[80%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[25%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center justify-end",
    },
  },
  P11: {
    1: {
      positions: [{ x: "left-[50%]", y: "top-1/2 -translate-y-1/2" }],
      containerClass: "flex items-center",
    },
    2: {
      positions: [
        { x: "left-[50%]", y: "top-[42%] -translate-y-1/2" },
        { x: "left-[50%]", y: "top-[58%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    3: {
      positions: [
        { x: "left-[50%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[50%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[50%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    4: {
      positions: [
        { x: "left-[70%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[65%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    5: {
      positions: [
        { x: "left-[70%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[65%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[42%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[58%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    6: {
      positions: [
        { x: "left-[70%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[65%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    7: {
      positions: [
        { x: "left-[70%]", y: "top-[30%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[43%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[57%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[70%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    8: {
      positions: [
        { x: "left-[70%]", y: "top-[25%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[37.5%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[62.5%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[75%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
    9: {
      positions: [
        { x: "left-[70%]", y: "top-[20%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[32%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[44%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[56%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[68%] -translate-y-1/2" },
        { x: "left-[70%]", y: "top-[80%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[35%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[50%] -translate-y-1/2" },
        { x: "left-[40%]", y: "top-[65%] -translate-y-1/2" },
      ],
      containerClass: "flex items-center",
    },
  },
  P12: {
    1: {
      positions: [{ x: "left-1/2 -translate-x-1/2", y: "bottom-[50%]" }],
      containerClass: "flex items-end justify-center",
    },
    2: {
      positions: [
        { x: "left-[42%] -translate-x-1/2", y: "bottom-[50%]" },
        { x: "left-[58%] -translate-x-1/2", y: "bottom-[50%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    3: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[50%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[50%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[50%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    4: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    5: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[42%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[58%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    6: {
      positions: [
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    7: {
      positions: [
        { x: "left-[30%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[43%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[57%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[70%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    8: {
      positions: [
        { x: "left-[25%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[37.5%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[62.5%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[75%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
    9: {
      positions: [
        { x: "left-[20%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[32%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[44%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[56%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[68%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[80%] -translate-x-1/2", y: "bottom-[70%]" },
        { x: "left-[35%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[50%] -translate-x-1/2", y: "bottom-[40%]" },
        { x: "left-[65%] -translate-x-1/2", y: "bottom-[40%]" },
      ],
      containerClass: "flex items-end justify-center",
    },
  },
};

// more lines than you venkat
