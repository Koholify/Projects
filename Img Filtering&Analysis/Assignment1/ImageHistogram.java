// Skeletal program for the "Image Histogram" assignment
// Written by:  Minglun Gong
//			 	Kyle Price  
//				Robin White
//
// "Image Histogram" takes an input image and performs 4 possible 
// histogram operations and displays the resulting histogram on screen
// Notes:
// 		- Not very useful for black and white images
//		- If the image is in gray scale the "display histogram" will 
//		  only display blue since the graphs will be overlapping

import java.util.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import java.awt.geom.*;
import java.io.*;
import javax.imageio.*;

// Main class
public class ImageHistogram extends Frame implements ActionListener {
	BufferedImage input;
	int width, height;
	TextField texRad, texThres;
	ImageCanvas source, target;
	PlotCanvas plot;
	// Constructor
	public ImageHistogram(String name) {
		super("Image Histogram");
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
		plot = new PlotCanvas();
		target = new ImageCanvas(input);
		main.setLayout(new GridLayout(1, 3, 10, 10));
		main.add(source);
		main.add(plot);
		main.add(target);
		// prepare the panel for buttons.
		Panel controls = new Panel();
		Button button = new Button("Display Histogram");
		button.addActionListener(this);
		controls.add(button);
		button = new Button("Histogram Stretch");
		button.addActionListener(this);
		controls.add(button);
		controls.add(new Label("Cutoff fraction:"));
		texThres = new TextField("10", 2);
		controls.add(texThres);
		button = new Button("Aggressive Stretch");
		button.addActionListener(this);
		controls.add(button);
		button = new Button("Histogram Equalization");
		button.addActionListener(this);
		controls.add(button);
		// add two panels
		add("Center", main);
		add("South", controls);
		addWindowListener(new ExitListener());
		setSize(width*2+400, height+100);
		setVisible(true);
	}
	class ExitListener extends WindowAdapter {
		public void windowClosing(WindowEvent e) {
			System.exit(0);
		}
	}
	
	//normalize histogram to percentage values
	public float[] normalize(int[] H) {
		float[] h = new float[256];
		for (int k=0; k<256; k++) {
			h[k] = (float)H[k] / (height*width);
		}
		return h;
	}
	
	
	/* REMOVED
	public int ignoreStartPoints(int [] tallies,int total,int toIgnore)
	{
		int avoidtot=0;
		
		//get min avoiding point
		int k=0;
		for ( int i=0 ; i<=toIgnore ; i++ )
		{
			int number=tallies[i];
			avoidtot=avoidtot+number;
			k=1;
		}
		return k;

	}
	
	public int ignoreEndPoints(int [] tallies,int total,int toIgnore)
	{
		int avoidtot=0;

		//get max avoiding point
		int j=0;
		for ( int i=255; i<=(total-toIgnore) ; i-- )
		{
			int number=tallies[i];
			avoidtot=avoidtot+number;
			j=1;
		}
		return j; // return the index value for where to stop looking

	}

	public int getMaxAlpha(int []tallies,float alpha)
	{
		int total=totalTally(tallies);
		int toIgnore=(int)(alpha*total);
		int maxValue=0;

		// max and min indexes to avoid
		int avoidMin= ignoreStartPoints(tallies,total,toIgnore);
		int avoidMax= ignoreEndPoints(tallies,total,toIgnore);

		for ( int i=avoidMin ;i<avoidMax ; i++ )
		{
			if (tallies[i]> maxValue)
			{
				maxValue= tallies[i];
			}
		}
		return maxValue;
	}

	public  int getMinAlpha(int [] tallies,float alpha)
	{
		int total=totalTally(tallies);
		int toIgnore=(int)(alpha*total);
		int minValue=256;
		// max and min indexes to avoid
		int avoidMin= ignoreStartPoints(tallies,total,toIgnore);
		int avoidMax= ignoreEndPoints(tallies,total,toIgnore);

		for ( int i=avoidMin ; i<avoidMax ; i++ )
		{
			if (tallies[i]< minValue)
			{
				minValue= tallies[i];
			}
		}
		return minValue;
	}
*/	
	//find total value of intensities in image
	public int totalTally(int[] tallies)
	{
		int total=0;
		for ( int i=0 ; i<tallies.length ; i++ )
		{
			int num=tallies[i];
			total= total+num;
		}
		return total;
	}
			

	public int[][] makeGrayImage()
	{
		//finds grey scale value of each pixel in image and stores in 2D array
		int[][] grayArray = new int[height][width];

			int gray=0;
			int red=0, green=0, blue=0;
			for ( int y=0; y<height ; y++ )
				for ( int x=0 ; x<width ; x++ ) {
					Color clr = new Color(input.getRGB(x, y));
					red = clr.getRed();
					green = clr.getGreen();
					blue = clr.getBlue();
					gray= (red+green+blue)/3;

					//store value @ index specifed by wisth and height
					grayArray[y][x]= gray;
				}

				return grayArray;

	}

	//Create base histogram of gray intensities
	public int[] tallyIntensities (int[][] grayArray)
	{
		int[] tallyArray = new int[256];
		for ( int j=0; j<height ; j++ )
			for ( int i=0 ; i<width ; i++ ) 
			{
				int intensity= grayArray[j][i];
				tallyArray[intensity]++;
			}
		return tallyArray;	
	}


	/*
	public static int getMin(int[] tallies)
	{
		int minValue=256;
		//int len= tallies.length;
		for ( int i=0 ; i<tallies.length ; i++ )
		{
			if (tallies[i]< minValue)
			{
				minValue= tallies[i];
			}
		}
		return minValue;
	}
	*/
	
	// Action listener for button click events
	public void actionPerformed(ActionEvent e) {
		// example -- compute the average color for the image
		if ( ((Button)e.getSource()).getLabel().equals("Display Histogram") ) {
			float red=0, green=0, blue=0;
			int[] redH = new int[256], 
				  greenH = new int[256], 
				  blueH = new int[256];
			for ( int y=0, i=0 ; y<height ; y++ )
				for ( int x=0 ; x<width ; x++, i++ ) {
					Color clr = new Color(input.getRGB(x, y));
					red += clr.getRed();
					redH[clr.getRed()] += 1;
					green += clr.getGreen();
					greenH[clr.getGreen()] += 1;
					blue += clr.getBlue();
					blueH[clr.getBlue()] += 1;
				}
			red /= width * height;
			green /= width * height;
			blue /= width * height;
			plot.histograms(normalize(redH), normalize(greenH), normalize(blueH));
			plot.setMeanColor(new Color((int)red,(int)green,(int)blue));
		}
		
		if ( ((Button)e.getSource()).getLabel().equals("Histogram Equalization") ) {
			int[][] F;
			int[] H = new int[256], E = new int[256];
			float[] h, C;
			
			F = makeGrayImage();
			H = tallyIntensities(F);
			h = normalize(H);
			C = new float[256];
			C[0] = h[0];
			//Produce CDF of h[]
			for(int k=1; k < 256; k++)
				C[k] = C[k-1] + h[k];
			
			for(int q=0; q<height; q++)
				for(int p=0; p<width; p++) {
					F[q][p] = (int)(C[F[q][p]] * 255);
				}
			for(int y=0; y<height; y++)
				for(int x=0; x<width; x++) 
					E[F[y][x]] ++;
			plot.histogram(normalize(E));
			
		}
		
		if(((Button)e.getSource()).getLabel().equals("Histogram Stretch") ) {
			int gray_level=256;
			int min=0,max= gray_level-1;
			int[][] gArray=makeGrayImage();

			int[] tallies =tallyIntensities(gArray);
			while(tallies[min] == 0 && min<tallies.length){
				min++;
			}
			while(tallies[max] == 0 && max>-1){
				max--;
			}
			
			for ( int y=0 ; y<height ; y++ )
				for ( int x=0 ; x<width ; x++ ) {

					gArray[y][x]=(gArray[y][x]-min)*(gray_level/(max-min));
				}
			int[] H = tallyIntensities(gArray);
			plot.histogram(normalize(H));

		}
		
		if(((Button)e.getSource()).getLabel().equals("Aggressive Stretch"))
		{
			
			float alpha = Float.parseFloat(texThres.getText());
			int gray_level=256;
			int min=0,max= gray_level-1;
			int gray;
			int [][] gArray=makeGrayImage();

			int cutoff = (int)(gray_level * (alpha/100.0));
			min += cutoff; max -= cutoff;

			for ( int y=0 ; y<height ; y++ )
				for ( int x=0 ; x<width ; x++ ) {

					int currentGray=gArray[y][x];
					gray = (currentGray-min)*gray_level/(max-min);
					if(gray > 255) gray = 255;
					else if (gray < 0) gray = 0;
					
					gArray[y][x] = gray;
				}
			int[] H = tallyIntensities(gArray);
			plot.histogram(normalize(H));

			

		}
		
		
	}
	public static void main(String[] args) {
		new ImageHistogram(args.length==1 ? args[0] : "baboon.png");
	}
}

// Canvas for plotting histogram
class PlotCanvas extends Canvas {
	// lines for plotting axes and mean color locations
	LineSegment x_axis, y_axis;
	LineSegment red, green, blue;
	ArrayList<LineSegment> graph, graphR, graphG, graphB;
	boolean showMean = false, histograms = false, histogram = false;

	public PlotCanvas() {
		x_axis = new LineSegment(Color.BLACK, -10, 0, 256+10, 0);
		y_axis = new LineSegment(Color.BLACK, 0, -10, 0, 200+10);
	}
	
	//find the max value
	//used for finding ratio to fit graph to canvas
	public static float getMax(float[] tallies)
	
	{
		float maxValue=0;
		for ( int i=0 ;i<tallies.length ; i++ )
		{
			if (tallies[i]> maxValue)
			{
				maxValue= tallies[i];
			}
		}
		return maxValue;
	}
	
	// set mean image color for plot
	public void setMeanColor(Color clr) {
		red = new LineSegment(Color.RED, clr.getRed(), 0, clr.getRed(), 100);
		green = new LineSegment(Color.GREEN, clr.getGreen(), 0, clr.getGreen(), 100);
		blue = new LineSegment(Color.BLUE, clr.getBlue(), 0, clr.getBlue(), 100);
		showMean = true;
		repaint();
	}
	
	//draw histograms for the three color channels
	public void histograms(float[] histRed, float[] histGreen, float[] histBlue) {
		graphR = new ArrayList<>(255);
		graphG = new ArrayList<>(255);
		graphB = new ArrayList<>(255);
		float addHeightR = 200 / getMax(histRed);
		float addHeightG = 200 / getMax(histGreen);
		float addHeightB = 200 / getMax(histBlue);
		for(int i=0; i<255;i++) {
			LineSegment lineR = new LineSegment(Color.RED, i, (int)(histRed[i]*addHeightR), i+1, (int)(histRed[i+1]*addHeightR));
			graphR.add(i, lineR);
			LineSegment lineG = new LineSegment(Color.GREEN, i, (int)(histGreen[i]*addHeightG), i+1, (int)(histGreen[i+1]*addHeightG));
			graphG.add(i, lineG);
			LineSegment lineB = new LineSegment(Color.BLUE, i, (int)(histBlue[i]*addHeightB), i+1, (int)(histBlue[i+1]*addHeightB));
			graphB.add(i, lineB);
		}
		histograms = true;
		histogram = false;
	}
	
	//draw histogram in black for histogram operations that use the grey scale
	public void histogram(float[] h) {
		graph = new ArrayList<>(255);
		float addHeight = 200 / getMax(h);
		for(int i=0; i<255; i++) {
			LineSegment line = new LineSegment(Color.BLACK, i, (int)(h[i]*addHeight), i+1, (int)(h[i+1]*addHeight));
			graph.add(i, line);
		}
	
		showMean = false;
		histograms = false;
		histogram = true;
		repaint();
	}
	// redraw the canvas
	public void paint(Graphics g) {
		// draw axis
		int xoffset = (getWidth() - 256) / 2;
		int yoffset = (getHeight() - 200) / 2;
		x_axis.draw(g, xoffset, yoffset, getHeight());
		y_axis.draw(g, xoffset, yoffset, getHeight());
		if ( showMean ) {
			red.draw(g, xoffset, yoffset, getHeight());
			green.draw(g, xoffset, yoffset, getHeight());
			blue.draw(g, xoffset, yoffset, getHeight());
		}
		if ( histograms ) {
			for (LineSegment line : graphR) {
				line.draw(g, xoffset, yoffset, getHeight());
			}
			for (LineSegment line : graphG) {
				line.draw(g, xoffset, yoffset, getHeight());
			}
			for (LineSegment line : graphB) {
				line.draw(g, xoffset, yoffset, getHeight());
			}
		}
		if ( histogram ) 
			for (LineSegment line : graph)
				line.draw(g, xoffset, yoffset, getHeight());
	}
}

// LineSegment class defines line segments to be plotted
class LineSegment {
	// location and color of the line segment
	int x0, y0, x1, y1;
	Color color;
	// Constructor
	public LineSegment(Color clr, int x0, int y0, int x1, int y1) {
		color = clr;
		this.x0 = x0; this.x1 = x1;
		this.y0 = y0; this.y1 = y1;
	}
	public void draw(Graphics g, int xoffset, int yoffset, int height) {
		g.setColor(color);
		g.drawLine(x0+xoffset, height-y0-yoffset, x1+xoffset, height-y1-yoffset);
	}
}
