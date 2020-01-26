// Kyle Price
// Robin White 


import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import java.io.*;
import java.util.Collections;

import javax.imageio.*;
import javax.swing.*;

// Main class
public class CornerDetection extends Frame implements ActionListener {
	BufferedImage input;
	int width, height;
	double sensitivity=.1;
	int threshold=20;
	TextField texThres;
	int[][] Ax, Ay, Axy;
	int[][] R, corners;
	ImageCanvas source, target;
	CheckboxGroup metrics = new CheckboxGroup();
	// Constructor
	public CornerDetection(String name) {
		super("Corner Detection");
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
		target = new ImageCanvas(width, height);
		main.setLayout(new GridLayout(1, 2, 10, 10));
		main.add(source);
		main.add(target);
		// prepare the panel for buttons.
		Panel controls = new Panel();
		Button button = new Button("Derivatives");
		button.addActionListener(this);
		controls.add(button);
		// Use a slider to change sensitivity
		JLabel label1 = new JLabel("sensitivity=" + sensitivity);
		controls.add(label1);
		JSlider slider1 = new JSlider(1, 25, (int)(sensitivity*100));
		slider1.setPreferredSize(new Dimension(50, 20));
		controls.add(slider1);
		slider1.addChangeListener(changeEvent -> {
			sensitivity = slider1.getValue() / 100.0;
			label1.setText("sensitivity=" + (int)(sensitivity*100)/100.0);
		});
		button = new Button("Corner Response");
		button.addActionListener(this);
		controls.add(button);
		JLabel label2 = new JLabel("threshold=" + threshold);
		controls.add(label2);
		JSlider slider2 = new JSlider(0, 100, threshold);
		slider2.setPreferredSize(new Dimension(50, 20));
		controls.add(slider2);
		slider2.addChangeListener(changeEvent -> {
			threshold = slider2.getValue();
			label2.setText("threshold=" + threshold);
		});
		/*controls.add(new Label("Threshold:"));
		texThres = new TextField("7000", 4);
		controls.add(texThres);*/
		button = new Button("Thresholding");
		button.addActionListener(this);
		controls.add(button);
		button = new Button("Non-max Suppression");
		button.addActionListener(this);
		controls.add(button);
		button = new Button("Display Corners");
		button.addActionListener(this);
		controls.add(button);
		// add two panels
		add("Center", main);
		add("South", controls);
		addWindowListener(new ExitListener());
		setSize(Math.max(width*2+100,850), height+110);
		setVisible(true);
	}
	class ExitListener extends WindowAdapter {
		public void windowClosing(WindowEvent e) {
			System.exit(0);
		}
	}
	// Action listener for button click events
	public void actionPerformed(ActionEvent e) {
		// generate Moravec corner detection result
		if ( ((Button)e.getSource()).getLabel().equals("Derivatives") )
			derivatives();
		if ( ((Button)e.getSource()).getLabel().equals("Corner Response") ){
			Ax = gaussionFilter(Ax);
		    Ay = gaussionFilter(Ay);
		    Axy = gaussionFilter(Axy);
			cornerResponse();
		}
		if ( ((Button)e.getSource()).getLabel().equals("Thresholding") ){
			threshold();
		}
		if ( ((Button)e.getSource()).getLabel().equals("Non-max Suppression") ){
			corners = nonmax();
			for(int y=0; y<height; y++)
				for(int x=0; x<width; x++)
				{
					if(corners[x][y] > 0)
						target.image.setRGB(x,y, new Color(255,255,255).getRGB());
					else
						target.image.setRGB(x, y, new Color(0,0,0).getRGB());
				}
			target.repaint();
		}
		
		if ( ((Button)e.getSource()).getLabel().equals("Display Corners") ){
			ColorModel cm = source.image.getColorModel();
			boolean preM = cm.isAlphaPremultiplied();
			WritableRaster ras = source.image.copyData(null);
			target.image = new BufferedImage(cm,ras,preM, null);
			
			for(int y=0; y<height; y++)
				for(int x=0; x<width; x++)
				{
					if(corners[x][y] > 0){
						target.image.setRGB(x, y, Color.red.getRGB());
						target.image.setRGB(x-1, y-1, Color.red.getRGB());
						target.image.setRGB(x+1, y-1, Color.red.getRGB());
						target.image.setRGB(x+1, y+1, Color.red.getRGB());
						target.image.setRGB(x-1, y+1, Color.red.getRGB());
					}
				}
			target.repaint();
		}
	}
	public static void main(String[] args) {
		new CornerDetection(args.length==1 ? args[0] : "signal_hill.png");
	}

	// moravec implementation
	void derivatives() {
		int l, t, r, b, dx, dy;
		Color clr1, clr2;
		int gray1, gray2;
		
		Ax = new int[width][height];
		Ay = new int[width][height];
		Axy = new int[width][height];
		
		for ( int q=0 ; q<height ; q++ ) {
			t = q==0 ? q : q-1;
			b = q==height-1 ? q : q+1;
			for ( int p=0 ; p<width ; p++ ) {
				l = p==0 ? p : p-1;
				r = p==width-1 ? p : p+1;
				clr1 = new Color(source.image.getRGB(l,q));
				clr2 = new Color(source.image.getRGB(r,q));
				gray1 = clr1.getRed() + clr1.getGreen() + clr1.getBlue();
				gray2 = clr2.getRed() + clr2.getGreen() + clr2.getBlue();
				dx = (gray2 - gray1) / 3;
				clr1 = new Color(source.image.getRGB(p,t));
				clr2 = new Color(source.image.getRGB(p,b));
				gray1 = clr1.getRed() + clr1.getGreen() + clr1.getBlue();
				gray2 = clr2.getRed() + clr2.getGreen() + clr2.getBlue();
				dy = (gray2 - gray1) / 3;
				//System.out.println(dx+"  "+dy);
				Ax[p][q] = dx*dx;
				Ay[p][q] = dy*dy;
				Axy[p][q] = dx*dy;
				dx = Math.max(-128, Math.min(dx, 127));
				dy = Math.max(-128, Math.min(dy, 127));
				target.image.setRGB(p, q, new Color(dx+128, dy+128, 128).getRGB());
			}
		}
		target.repaint();
	}
	
	
	int[][] gaussionFilter(int[][] arr)
	{
		int[][] org = arr;
		int[][] template = new int[5][5];
		int center = 3;
		int total = 256;
		template = new int[][]{{1,4,6,4,1},
							   {4,16,24,16,4},
							   {6,24,36,24,6},
							   {4,16,24,16,4},
							   {1,4,6,4,1}};		
		int sum;
		for(int y=center-1; y<height-center; y++)
		{
			for(int x=center-1; x<width-center; x++)
			{
				sum = 0;
				for(int u=-center+1; u<center; u++)
					for(int v=-center+1; v<center; v++)
					{
						sum += org[x+v][y+u] * template[v+center-1][u+center-1];
					}
				org[x][y] = (sum/total);
			}
		}
		return org;
			
	}
	
	void cornerResponse()
	{
		R = new int[width][height];
		int r,b,g;
		for ( int q=0 ; q<height ; q++ ) {
			for ( int p=0 ; p<width ; p++ ) {
				int A = Ax[p][q];
				int B = Ay[p][q];
				int C = Axy[p][q];
				R[p][q] = (int) (Math.log((A*B-C*C) - (int)(sensitivity*((A+B)*(A+B))))*10);
				r = (R[p][q] > 0 ? Math.min(255, R[p][q]): 33);
				b = (R[p][q] < 0 ? 205: 0);
				g = (R[p][q]<50 && R[p][q]>-50 ? 50: 171);
				target.image.setRGB(p, q, new Color(r,g,b).getRGB());
			}
		}
		target.repaint();
	}
	
	void threshold(){
		int thresh = threshold;
		for(int y=0; y<height; y++)
			for(int x=0; x<width; x++)
			{
				if(R[x][y] < thresh) R[x][y]=0; 
				int val = Math.min(R[x][y]*2, 255);
				target.image.setRGB(x, y, new Color(val,val,val).getRGB()); 
			}
		target.repaint();
	}
	
	int[][] nonmax()
	{
		int[][] output = new int[width][height];
		
		for(int y=1; y<height-1; y++)
			for(int x=1; x<width-1; x++)
			{
				if(R[x][y] > 0)
				{
					if( R[x][y] > R[x-1][y-1]
						&& R[x][y] > R[x][y-1]
						&& R[x][y] > R[x+1][y-1]
						&& R[x][y] > R[x-1][y]
						&& R[x][y] > R[x+1][y]
						&& R[x][y] > R[x-1][y+1]
						&& R[x][y] > R[x][y+1]
						&& R[x][y] > R[x+1][y+1])
					{
						output[x][y] = 1;
					}
					else
						output[x][y] = 0;
				}
				else
					output[x][y] = 0;
					
			}
		return output;
	}
	
	int getMax(int[][] a)
	{
		int max = -100000;
		for(int[] b: a)
			for(int c : b)
				if(c>max) max = c;
		return max;
	}
	
}
