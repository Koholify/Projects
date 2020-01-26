// Kyle Price 	
// Robin White	
//
// "SmoothingFilter" takes an input image and performs 4 possible 
// smoothing filters and displays the resulting image on screen on the right
// 
//		

import java.util.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;

// Main class
public class SmoothingFilter extends Frame implements ActionListener {
	BufferedImage input;
	ImageCanvas source, target;
	TextField texSigma;
	int width, height;
	// Constructor
	public SmoothingFilter(String name) {
		super("Smoothing Filters");
		// load image
		try {
			input = ImageIO.read(new File(name));
		}
		catch ( Exception ex ) {
			ex.printStackTrace();
		}
		width = input.getWidth();
		height = input.getHeight();
		// prepare the panel for image canvas.
		Panel main = new Panel();
		source = new ImageCanvas(input);
		target = new ImageCanvas(input);
		main.setLayout(new GridLayout(1, 2, 10, 10));
		main.add(source);
		main.add(target);
		// prepare the panel for buttons.
		Panel controls = new Panel();
		Button button = new Button("Add noise");
		button.addActionListener(this);
		controls.add(button);
		button = new Button("5x5 mean");
		button.addActionListener(this);
		controls.add(button);
		controls.add(new Label("Sigma:"));
		texSigma = new TextField("1", 1);
		controls.add(texSigma);
		button = new Button("5x5 Gaussian");
		button.addActionListener(this);
		controls.add(button);
		button = new Button("5x5 median");
		button.addActionListener(this);
		controls.add(button);
		button = new Button("5x5 Kuwahara");
		button.addActionListener(this);
		controls.add(button);
		// add two panels
		add("Center", main);
		add("South", controls);
		addWindowListener(new ExitListener());
		setSize(width*2+100, height+100);
		setVisible(true);
	}
	class ExitListener extends WindowAdapter {
		public void windowClosing(WindowEvent e) {
			System.exit(0);
		}
	}
	
	//kernel object to used to traverse the image
	class Kernel{
		int[][][]k;				//k[x][y][r,g,b]
		int w, l, sum[];
		int xpos, ypos;
		public Kernel(int w){
			l = w*2+1;
			k = new int[l][l][3]; 
			this.w = w;
			}
		
		//place kernel anywhere on current 
		//source image
		public void setKernel(int x, int y){
			xpos = x;
			ypos = y;
			sum = new int[]{0,0,0};
			Color clr;
			for(int u= -w; u<=w; u++)
				for(int v= -w; v<=w; v++)
				{
					if((x+v<0 || x+v>=width) && (y+u<0 || y+u>=height)){
						int shiftx, shifty;
						shiftx = (x+v<0) ? 0 : width-1;
						shifty = (y+u<0) ? 0 : height-1;
						clr = new Color(source.image.getRGB(shiftx,shifty));
					}
					else if(x+v<0 || x+v>=width){
						int shift;
						shift = (x+u<0) ? 0 : width-1;
						clr = new Color(source.image.getRGB(shift, y+u));
					}
					else if(y+u<0 || y+u>=height){
						int shift;
						shift = (y+u<0) ? 0 : height-1;
						clr = new Color(source.image.getRGB(x+v, shift));
					}
					else {
						clr = new Color(source.image.getRGB(x+v,y+u));
					}
					k[u+w][v+w] = new int[] {clr.getRed(), clr.getGreen(), clr.getBlue()};
						
				}
			
		}
		
		public int[][][] get() { return k; }
		
		public void initializeSum() {sum = getSum();}
		
		public int[] getSum() { 
			int[] total = new int[3];
			for(int u=0; u<l; u++)
				for(int v=0; v<l; v++)
					for(int i=0; i<3; i++)
						total[i] += k[v][u][i];
			sum = total;
			return total;	
		}
		
		//return mean of current kernel
		//Used in Kuwahara 
		public int[] getMean(){
			int[] total = new int[3];
			for(int u=0; u<l; u++)
				for(int v=0; v<l; v++)
					for(int i=0; i<3; i++)
						total[i] += k[v][u][i];
			total[0] = total[0]/(l*l);
			total[1] = total[1]/(l*l);
			total[2] = total[2]/(l*l);
			return total;
		}
		
		//move the kernel 1 pixel to the left
		//returns sum of new kernel
		public int[] increment(){
			xpos++;
			Kernel next = new Kernel(w);
			next.setKernel(xpos, ypos);
			this.updateSum(next);
			k = next.get();
			return sum;
		}
		
		private void updateSum(Kernel next){
			for(int[][] row : k)
				for(int i=0; i<3; i++)
					sum[i] -= row[0][i];
			for(int[][] row : next.get())
				for(int i=0; i<3; i++)
					sum[i] += row[row.length-1][i];
		}
		
	}
	
	//calculate gaussian function to be used for
	//Gaussian 
	public int[] getGaussianKernel(){
		double[] g = new double[5];
		int[] k = new int[5];
		float sigma = Float.parseFloat(texSigma.getText());
		for(int i=0; i<5; i++)
		{
			g[i] = Math.exp((-(i*i)/(2*sigma*sigma))/(2*Math.PI*sigma*sigma));
		}
		g[2] = g[0]; g[0]=g[4]; g[3]=g[1];
		double alpha = 2/g[0];
		for(int d=0; d<5; d++)
			k[d] = (int) (g[d]*alpha);
		return k;
	}
	
	//Calculate variance for
	//Kuwahara 
	public float getVariance3x3(Kernel kernel, int[] mean){
		int[][][] k = kernel.get();
		float[] vars = new float[3];
		float var =0;
		for(int y=0; y<3; y++)
			for(int x=0; x<3; x++)
				for(int z=0; z<3; z++){
				vars[z] += Math.pow(2, (k[x][y][z] - mean[z]));
			}
		for(float v : vars){
			v = (v/8);
			var += v;
		}
		return var;			
	}
	
	//find the min value of 4 numbers
	//used for Kuwahara
	public float findMin(float f1, float f2, float f3, float f4){
		float[] all = new float[]{f1,f2,f3,f4};
		float min=f1;
		for(float f : all)
			if(f<min) min=f;
		return min;	
	}
	
	//turns 3D array into 3 1D arrays and calls on function to get median
	public int[] orderElements(int[][][] boxedPortion)
	{

		//turn given 2D arrray into 1D array
		//think should only be looking at 25 elements at a time
		int[] arrayOneDRed = new int [25];
		int[] arrayOneDGreen = new int [25];
		int[] arrayOneDBlue = new int [25];

		int count=0;
		for (int i = 0; i <boxedPortion.length; i++) 
		{
			for (int j = 0; j < boxedPortion[i].length; j++) 
			{
				// takes boxed array and at each position i of arrayOneD, adds the corresponding r g b value
					arrayOneDRed[count]=(boxedPortion[i][j][0]);
					arrayOneDGreen[count]=(boxedPortion[i][j][1]); 
					arrayOneDBlue[count]=(boxedPortion[i][j][2]); 
					count++;
			}
		}

		//array for the resultant median R G and B values
		int[] RGBArray= new int [3];
		int medianRed= getArrayMedian(arrayOneDRed);
		int medianGreen= getArrayMedian(arrayOneDGreen);
		int medianBlue= getArrayMedian(arrayOneDBlue);
		RGBArray[0]=medianRed;
		RGBArray[1]=medianGreen;
		RGBArray[2]=medianBlue;

		return RGBArray; //returns 1D array with median RGB values

	}

	//gives the median a value, given a 1 D array
	public int getArrayMedian (int [] givenArray)
	{
		int median;
		Arrays.sort(givenArray); 

		return median = givenArray[13];// 13 will always be the midway point 


	}
	
	// Action listener for button click events
	public void actionPerformed(ActionEvent e) {
		// example -- add random noise
		if ( ((Button)e.getSource()).getLabel().equals("Add noise") ) {
			Random rand = new Random();
			int dev = 64;
			for ( int y=0, i=0 ; y<height ; y++ )
				for ( int x=0 ; x<width ; x++, i++ ) {
					Color clr = new Color(source.image.getRGB(x, y));
					int red = clr.getRed() + (int)(rand.nextGaussian() * dev);
					int green = clr.getGreen() + (int)(rand.nextGaussian() * dev);
					int blue = clr.getBlue() + (int)(rand.nextGaussian() * dev);
					red = red < 0 ? 0 : red > 255 ? 255 : red;
					green = green < 0 ? 0 : green > 255 ? 255 : green;
					blue = blue < 0 ? 0 : blue > 255 ? 255 : blue;
					source.image.setRGB(x, y, (new Color(red, green, blue)).getRGB());
				}
			source.repaint();
		}
		
		if ( ((Button)e.getSource()).getLabel().equals("5x5 mean") ) {
			Kernel kernel = new Kernel(2); 
			for(int y=0; y<height; y++){
				kernel.setKernel(0, y);
				kernel.initializeSum();
				for(int x=0; x<width; x++){
					int[] sum = kernel.increment();
					int mean_color = new Color(sum[0]/25, sum[1]/25, sum[2]/25).getRGB();
					target.image.setRGB(x, y, mean_color);
				}
			}
			target.repaint();
		}
		
		if ( ((Button)e.getSource()).getLabel().equals("5x5 Gaussian") ) {
			int[][][] T = new int[width][height][3], G = new int[width][height][3];
			int w = 2;
			Color clr;
			int[] filter = getGaussianKernel();
			int m = 0;
			for (int f : filter)
				m+=f;
			m = (int) Math.pow(m, 2);
			for (int y=0; y<height; y++)
				for(int x=0; x<width; x++){
					T[x][y] = new int[]{0,0,0};
					for(int u=-w; u <=w; u++){
						if(x+u<0 || x+u>=width){
							int shift;
							shift = (x+u<0) ? 0 : width-1;
							clr = new Color(source.image.getRGB(shift, y));
						}
						else
							clr = new Color(source.image.getRGB(x+u,y));
						
						T[x][y][0] += clr.getRed()*(filter[u+w]);
						T[x][y][1] += clr.getGreen()*(filter[u+w]);
						T[x][y][2] += clr.getBlue()*(filter[u+w]);
					}	
				}
			for (int x=0; x<width; x++)
				for(int y=0; y<height; y++){
					G[x][y] = new int[]{0,0,0};
					int[] c = new int[3];
					for(int v=-w; v<=w; v++){
						if(y+v<0 || y+v>=height){
							int shift;
							shift = (y+v<0) ? 0 : height-1;
							c = new int[]{T[x][shift][0],T[x][shift][1],T[x][shift][2]};
						}
						else
							c = new int[]{T[x][y+v][0],T[x][y+v][1],T[x][y+v][2]};
						G[x][y][0] += c[0]*(filter[v+w]);
						G[x][y][1] += c[1]*(filter[v+w]);
						G[x][y][2] += c[2]*(filter[v+w]);
					}
				}
			for(int y=0; y<height; y++){
				for(int x=0; x<width; x++){
					int gaus = new Color(G[x][y][0]/m,G[x][y][1]/m,G[x][y][2]/m).getRGB();
					target.image.setRGB(x, y, gaus);
				}
				
			}
						
			target.repaint();
		}
		
		if ( ((Button)e.getSource()).getLabel().equals("5x5 median") ) {
			Kernel kernel = new Kernel(2); 
			// go along moving kernel
			for(int y=0; y<height; y++){
				for(int x=0; x<width; x++){
					kernel.setKernel(x,y);
					int[][][] median = kernel.get();
					// calls on fucntion to get median
					int [] median_color = orderElements(median);
				    int colorMedian= new Color(median_color[0],median_color[1],median_color[2]).getRGB();
					//sets new RGb value for each pixel
					target.image.setRGB(x, y, colorMedian);
				}
			}
			target.repaint();
		}
		
		if ( ((Button)e.getSource()).getLabel().equals("5x5 Kuwahara") ) {
			int[] mean1, mean2, mean3, mean4;
			float var1, var2, var3, var4;
			Color clr;
			for(int y=0; y<height; y++)
				for(int x=0; x<width; x++)
				{
					//create unique kernel for
					//each 3x3 neighbourhood
					Kernel k1 = new Kernel(1);
					Kernel k2 = new Kernel(1);
					Kernel k3 = new Kernel(1);
					Kernel k4 = new Kernel(1);
					k1.setKernel(x-1,y+1);
					k2.setKernel(x+1,y+1);
					k3.setKernel(x+1,y-1);
					k4.setKernel(x-1,y-1);
					
					mean1 = k1.getMean();
					mean2 = k2.getMean();
					mean3 = k3.getMean();
					mean4 = k4.getMean();
					
					var1 = getVariance3x3(k1, mean1);
					var2 = getVariance3x3(k2, mean2);
					var3 = getVariance3x3(k3, mean3);
					var4 = getVariance3x3(k4, mean4);
					
					float section = findMin(var1, var2, var3, var4);
					
					if(section == var1) clr = new Color(mean1[0],mean1[1],mean1[2]);
					else if(section == var2) clr = new Color(mean2[0],mean2[1],mean2[2]);
					else if(section == var3) clr = new Color(mean3[0],mean3[1],mean3[2]);
					else clr = new Color(mean4[0],mean4[1],mean4[2]);
					
					target.image.setRGB(x, y, clr.getRGB());
					
				}
			target.repaint();	
				
		}
	}
	public static void main(String[] args) {
		new SmoothingFilter(args.length==1 ? args[0] : "baboon.png");
		
	}
}
