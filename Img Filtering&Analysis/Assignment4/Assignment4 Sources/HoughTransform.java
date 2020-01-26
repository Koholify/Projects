// Kyle Price
// Robin White 
// Notes: Window has to be reset after creating the Transform
//

import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import java.io.*;
import java.util.ArrayList;

import javax.imageio.*;

// Main class
public class HoughTransform extends Frame implements ActionListener {
	BufferedImage input;
	int width, height, diagonal;
	ImageCanvas source, target;
	TextField texRad, texThres;
	// Constructor
	public HoughTransform(String name) {
		super("Hough Transform");
		// load image
		try {
			input = ImageIO.read(new File(name));
		}
		catch ( Exception ex ) {
			ex.printStackTrace();
		}
		width = input.getWidth();
		height = input.getHeight();
		diagonal = (int)Math.sqrt(width * width + height * height);
		// prepare the panel for two images.
		Panel main = new Panel();
		source = new ImageCanvas(input);
		target = new ImageCanvas(input);
		main.setLayout(new GridLayout(1, 2, 10, 10));
		main.add(source);
		main.add(target);
		// prepare the panel for buttons.
		Panel controls = new Panel();
		Button button = new Button("Line Transform");
		button.addActionListener(this);
		controls.add(button);
		controls.add(new Label("Radius:"));
		texRad = new TextField("10", 3);
		controls.add(texRad);
		button = new Button("Circle Transform");
		button.addActionListener(this);
		controls.add(button);
		controls.add(new Label("Threshold:"));
		texThres = new TextField("180", 3);
		controls.add(texThres);
		button = new Button("Search");
		button.addActionListener(this);
		controls.add(button);
		// add two panels
		add("Center", main);
		add("South", controls);
		addWindowListener(new ExitListener());
		setSize(diagonal*2+100, Math.max(height,360)+100);
		setVisible(true);
	}
	class ExitListener extends WindowAdapter {
		public void windowClosing(WindowEvent e) {
			System.exit(0);
		}
	}
	// Action listener
	public void actionPerformed(ActionEvent e) {
		// perform one of the Hough transforms if the button is clicked.
		if ( ((Button)e.getSource()).getLabel().equals("Line Transform") ) {
			int[][] g = new int[360][diagonal];
			ArrayList<int[]> points = new ArrayList<>();
			int thresh = Integer.parseInt(texThres.getText());
			for ( int y=0 , i=0; y<height ; y++ )
				for ( int x=0 ; x<width ; x++)
				{
					int pixel = source.image.getRGB(x, y);
					if(pixel != -1){
						points.add(new int[]{x,y});
					}
				}
			g = HoughLines(points);
			DisplayTransform(diagonal, 360, g);
			highlightLines(width, height, g, thresh);
		}
		else if ( ((Button)e.getSource()).getLabel().equals("Circle Transform") ) {
			int[][] g = new int[height][width];
			ArrayList<int[]> points = new ArrayList<>();
			int radius = Integer.parseInt(texRad.getText());
			int thresh = Integer.parseInt(texThres.getText());
			for ( int y=0 , i=0; y<height ; y++ )
				for ( int x=0 ; x<width ; x++)
				{
					int pixel = source.image.getRGB(x, y);
					if(pixel != -1){
						points.add(new int[]{x,y});
					}
				}
			g = HoughCircle(points, radius);
			DisplayTransform(width, height, g);
			highlightCircle(width, height, g, radius, thresh);
		}
	}
	// display the spectrum of the transform.
	public void DisplayTransform(int wid, int hgt, int[][] g) {
		target.resetBuffer(wid, hgt);
		for ( int y=0, i=0 ; y<hgt ; y++ )
			for ( int x=0 ; x<wid ; x++, i++ )
			{
				int value = g[y][x] > 255 ? 255 : g[y][x];
				target.image.setRGB(x, y, new Color(value, value, value).getRGB());
			}
		target.repaint();
	}
	
	public int[][] HoughLines(ArrayList<int[]> points)
	{
		int centerx = width/2;
		int centery = height/2;
		int[][] g = new int[360][diagonal];
		for(int[] point : points)
		{
			int x = point[0];
			int y = point[1];
			for(int theta=0; theta<360; theta++)
			{
				double rad = ((theta)*Math.PI)/180;
				double ro = ((x-centerx)*Math.cos(rad)+(y-centery)*Math.sin(rad));
				int scaled_ro = (int) (ro+diagonal/2);
				if(scaled_ro>=diagonal || scaled_ro < 0) continue;
				g[theta][scaled_ro]++;
			}
		}
		return scaleG(g);
	}
	
	public int[][] HoughCircle(ArrayList<int[]> points, int r)
	{
		int[][] g = new int[height][width];
		for(int [] point : points)
		{
			int x = point[0];
			int y = point[1];
			for(int theta=0; theta<360; theta++)
			{
				double rad = (theta*Math.PI)/180;
				int a = Math.round( (float) (x-r*Math.cos(rad)) );
				int b = Math.round( (float) (y-r*Math.sin(rad)) );
				if(a>=width || a<0) continue;
				if(b>=height || b<0) continue;
				g[b][a]++;
			}
		} 
		return scaleG(g);
	}
	
	public int[][] scaleG(int[][] d)
	{
		int max = 0;
		for(int i=0; i<d.length;i++)
			for(int j=0; j<d[0].length; j++)
				if( d[i][j]>max ) max = d[i][j];
		for(int i=0; i<d.length;i++)
			for(int j=0; j<d[0].length; j++)
				d[i][j] = (int) (d[i][j]*(255.0/max));
		return d;
	}
	
	void highlightCircle(int widt, int hgt, int[][] g, int r, int thresh)
	{
		//source.resetBuffer(widt, hgt);
		for(int i=0; i<g.length; i++)
			for(int j=0; j<g[1].length; j++)
				if(g[j][i] > thresh ) drawCircle(i, j, r);
	}
	
	void drawCircle(int x0, int y0, int r)
	{
		int x=0, y=r;
		int d = 1-r;
		while(y>=x)
		{
			source.image.setRGB(x0+x, y0+y, Color.RED.getRGB());
			source.image.setRGB(x0+(-x), y0+y, Color.RED.getRGB());
			source.image.setRGB(x0+(-x), y0+(-y), Color.RED.getRGB());
			source.image.setRGB(x0+(x), y0+(-y), Color.RED.getRGB());
			source.image.setRGB(x0+y, y0+x, Color.RED.getRGB());
			source.image.setRGB(x0+(-y), y0+x, Color.RED.getRGB());
			source.image.setRGB(x0+y, y0+(-x), Color.RED.getRGB());
			source.image.setRGB(x0+(-y), y0+(-x), Color.RED.getRGB());
			
			if(d<0){
				d += x*2+3;
				x++;
			}
			else{
				d += (x-y)*2+5;
				x++; y--;
			}
			
		}
		source.repaint();
	}
	
	public void highlightLines(int wdt, int hgt, int[][] g, int thres)
	{
		//source.resetBuffer(wdt, hgt);
		for(int i=0; i<g.length; i++)
			for(int j=0; j<g[1].length; j++)
				if(g[i][j] > thres ) drawLine(i, j-diagonal/2);
		
	}
	
	public void drawLine(int t, int r)
	{
		double rad = t*Math.PI/180;
		
		for(int y=0; y<height; y++)
		{
			int x = (int) ((r-(y-height/2)*Math.sin(rad))/Math.cos(rad)+width/2);
			if(x<0 || x>=width) continue;
			source.image.setRGB(x, y, Color.RED.getRGB());
		}
		
		for(int x=0; x<width; x++)
		{
			int y = (int) ((r-(x-width/2)*Math.cos(rad))/Math.sin(rad)+height/2);
			if(y<0 || y>=height) continue;
			source.image.setRGB(x, y, Color.RED.getRGB());
		}
		source.repaint();
	}

	public static void main(String[] args) {
		new HoughTransform(args.length==1 ? args[0] : "rectangle.png");
	}
}
